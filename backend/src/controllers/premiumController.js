const Product = require('../models/Product');
const Usage = require('../models/Usage');
const { logActivity } = require('../utils/logger');
const { queueLowStockReminder } = require('../utils/lowStockQueue');
const PDFDocument = require('pdfkit');

const getAnalytics = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const [totalProducts, totalStockAgg, categoryAgg] = await Promise.all([
      Product.countDocuments({ organizationId: orgId, isDeleted: false }),
      Product.aggregate([
        { $match: { organizationId: orgId, isDeleted: false } },
        { $group: { _id: null, totalStock: { $sum: '$stock' } } },
      ]),
      Product.aggregate([
        { $match: { organizationId: orgId, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 }, stock: { $sum: '$stock' } } },
      ]),
    ]);

    const totalStock = totalStockAgg[0]?.totalStock ?? 0;

    // Mongo comparisons between 2 fields require $expr; do it in JS to keep it robust.
    const allProducts = await Product.find(
      { organizationId: orgId, isDeleted: false },
      { name: 1, category: 1, stock: 1, lowStockThreshold: 1 }
    ).lean();
    const lowStockFiltered = allProducts.filter(
      p => typeof p.stock === 'number' && typeof p.lowStockThreshold === 'number' && p.stock <= p.lowStockThreshold
    );

    const inventoryValueAgg = await Product.aggregate([
      { $match: { organizationId: orgId, isDeleted: false } },
      { $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } } } },
    ]);
    const inventoryValue = inventoryValueAgg[0]?.value ?? 0;

    return res.json({
      totalProducts,
      totalStock,
      lowStockCount: lowStockFiltered.length,
      lowStockProducts: lowStockFiltered.slice(0, 10),
      inventoryValue,
      categories: categoryAgg.map(x => ({
        category: x._id,
        count: x.count,
        stock: x.stock,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSV import expects fields: name, category, price, stock
const importProducts = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

    const csv = require('csv-parser');
    const { Readable } = require('stream');

    const parseNumber = (value) => {
      const cleaned = String(value ?? '')
        .replace(/[^\d.-]/g, '') // strip currency symbols / commas etc.
        .trim();
      return Number(cleaned);
    };

    // Auto-detect separator: CSV might be comma (,), semicolon (;), or tab (\t).
    const sample = req.file.buffer.toString('utf8', 0, 4096);
    const firstLine = (sample.split(/\r?\n/)[0] ?? '').toString();
    const comma = (firstLine.match(/,/g) ?? []).length;
    const semi = (firstLine.match(/;/g) ?? []).length;
    const tab = (firstLine.match(/\t/g) ?? []).length;
    const counts = [
      { sep: ',', c: comma },
      { sep: ';', c: semi },
      { sep: '\t', c: tab },
    ].sort((a, b) => b.c - a.c);
    const detectedSeparator = counts[0]?.c > 0 ? counts[0].sep : ',';

    const products = [];
    const seenErrors = [];

    await new Promise((resolve, reject) => {
      const parser = csv({
        separator: detectedSeparator,
        mapHeaders: ({ header }) =>
          String(header ?? '')
            .trim()
            .replace(/\uFEFF/g, '') // handle BOM
            .toLowerCase()
            .replace(/\s+/g, '') // remove spaces: "Product Name" -> "productname"
            .replace(/[^a-z0-9_]/g, ''), // remove punctuation: "Product-Name" -> "productname"
      });
      Readable.from(req.file.buffer)
        .pipe(parser)
        .on('data', (row) => {
          try {
            const keys = Object.keys(row ?? {});
            const pick = (aliases = [], contains = []) => {
              for (const a of aliases) {
                if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') return row[a];
              }
              for (const k of keys) {
                const kk = String(k).toLowerCase();
                if (contains.some((c) => kk.includes(c))) {
                  const v = row[k];
                  if (v !== undefined && v !== null && String(v).trim() !== '') return v;
                }
              }
              return '';
            };

            const name = String(pick(['name', 'productname'], ['productname', 'product', 'name'])).trim();
            const category = String(pick(['category', 'productcategory'], ['category'])).trim();
            const warehouse = String(pick(['warehouse', 'warehousename', 'warehouseid'], ['warehouse']) || 'Main').trim();
            const price = parseNumber(pick(['price', 'unitprice'], ['price', 'mrp', 'rate']));
            const stock = parseNumber(pick(['stock', 'qty', 'quantity'], ['stock', 'qty', 'quantity']));

            if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
              seenErrors.push(row);
              return;
            }

            products.push({ name, category, warehouse, price, stock });
          } catch {
            seenErrors.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (products.length === 0) {
      return res.status(400).json({ message: 'No valid rows found', errors: seenErrors.slice(0, 5) });
    }

    // Enforce usage limit considering how many products we're importing.
    const usage = await Usage.findOne({ organizationId: orgId });
    const currentCount = usage?.productsCount ?? 0;
    const limit = req.plan.productLimit;
    const importingCount = products.length;

    if (currentCount + importingCount > limit) {
      return res.status(429).json({ message: 'Product limit exceeded', productsCount: currentCount, importing: importingCount, limit });
    }

    // Atomic usage increment to reduce race conditions.
    const remainingAllowed = limit - importingCount;
    const updatedUsage = await Usage.findOneAndUpdate(
      { organizationId: orgId, productsCount: { $lte: remainingAllowed } },
      { $inc: { productsCount: importingCount } },
      { new: true }
    );
    if (!updatedUsage) {
      return res.status(429).json({ message: 'Product limit exceeded' });
    }

    let inserted;
    try {
      inserted = await Product.insertMany(
        products.map(p => ({
          ...p,
          organizationId: orgId,
          isDeleted: false,
        }))
      );
    } catch (e) {
      // If the DB insert fails after claiming usage slots, rollback usage.
      await Usage.updateOne({ organizationId: orgId }, { $inc: { productsCount: -importingCount } });
      throw e;
    }

    await logActivity('PRODUCTS_BULK_IMPORTED', req.user._id, orgId, {
      count: inserted.length,
    });

    // Trigger email reminders for any low stock items in the import
    for (const p of inserted) {
      if (p.stock <= (p.lowStockThreshold || 5)) {
        await queueLowStockReminder(req.user.email, p);
      }
    }

    return res.json({ message: 'Products imported', importedCount: inserted.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportProducts = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const format = String(req.query.format ?? 'csv').toLowerCase();
    const category = String(req.query.category ?? 'all').toLowerCase();
    const warehouse = String(req.query.warehouse ?? 'all');
    const stockLevel = String(req.query.stockLevel ?? 'all').toLowerCase();
    const dateRange = String(req.query.dateRange ?? 'all').toLowerCase();

    const now = new Date();
    let since = null;
    if (dateRange === 'today') since = new Date(now.toDateString());
    if (dateRange === 'week') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (dateRange === 'month') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filter = { organizationId: orgId, isDeleted: false };
    if (category !== 'all') filter.category = category.charAt(0).toUpperCase() + category.slice(1);
    if (warehouse !== 'all') filter.warehouse = warehouse;

    if (stockLevel === 'out') {
      filter.stock = 0;
    } else if (stockLevel === 'low') {
      // Low stock: stock > 0 and stock <= lowStockThreshold
      filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] };
    }

    if (since) filter.createdAt = { $gte: since };

    const products = await Product.find(filter).lean();

    await logActivity('EXPORT_GENERATED', req.user._id, orgId, {
      format,
      productCount: products.length,
      category,
      warehouse,
      stockLevel,
      dateRange,
    });

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="products-${orgId}.pdf"`);
      doc.pipe(res);

      doc.fontSize(16).text('Inventory Export Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${now.toISOString()}`);
      doc.text(`Products: ${products.length}`);
      doc.moveDown();

      const maxRows = 500;
      const rows = products.slice(0, maxRows);
      doc.fontSize(10);
      rows.forEach((p, idx) => {
        doc.text(
          `${idx + 1}. ${p.name} | ${p.category} | Warehouse: ${p.warehouse ?? 'Main'} | Stock: ${p.stock} | Price: ${p.price}`
        );
      });

      if (products.length > maxRows) {
        doc.moveDown();
        doc.text(`...and ${products.length - maxRows} more rows.`);
      }

      doc.end();
      return;
    }

    // Default: CSV
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['name', 'category', 'warehouse', 'price', 'stock'];
    const lines = [
      header.map(esc).join(','),
      ...products.map((p) => [p.name, p.category, p.warehouse ?? 'Main', p.price, p.stock].map(esc).join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-${orgId}.csv"`);
    return res.status(200).send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics, importProducts, exportProducts };

