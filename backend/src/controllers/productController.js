const Product = require('../models/Product');
const Usage = require('../models/Usage');
const { logActivity } = require('../utils/logger');
const { queueLowStockReminder } = require('../utils/lowStockQueue');
const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  warehouse: z.string().min(1).optional().default('Main'),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? v : Number(v)),
    z.number().nonnegative()
  ),
  stock: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? v : Number(v)),
    z.number().int().nonnegative()
  ),
});

const updateStockSchema = z.object({
  stock: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? v : Number(v)),
    z.number().int().nonnegative()
  ),
});

const objectIdLikeSchema = z.string().min(1);

const createProduct = async (req, res) => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid create product payload', errors: parsed.error.flatten() });
    }

    const { name, category, warehouse, price, stock } = parsed.data;
    const organizationId = req.user.organizationId;

    // Race-condition safe usage increment.
    // Even if two requests pass middleware checks at the same time,
    // only one will successfully claim the last available slot.
    const limit = req.plan?.productLimit;
    if (typeof limit === 'number') {
      const remainingAllowed = limit - 1;
      const updatedUsage = await Usage.findOneAndUpdate(
        { organizationId, productsCount: { $lte: remainingAllowed } },
        { $inc: { productsCount: 1 } },
        { new: true }
      );
      if (!updatedUsage) {
        return res.status(429).json({ message: 'Product limit exceeded' });
      }
    } else {
      // Fallback (shouldn't happen if middleware sets req.plan)
      await Usage.updateOne({ organizationId }, { $inc: { productsCount: 1 } });
    }

    const product = await Product.create({
      name,
      category,
      warehouse,
      price,
      stock,
      organizationId,
    });

    await logActivity('PRODUCT_CREATED', req.user._id, organizationId, { productId: product._id });

    // Trigger email reminder if low stock.
    if (product.stock <= (product.lowStockThreshold || 5)) {
      await queueLowStockReminder(req.user.email, product);
    }

    res.status(201).json(product);
  } catch (err) {
    // If Product.create fails after we've incremented usage, roll back usage.
    if (req?.user?.organizationId && req?.plan?.productLimit && req?.body) {
      try {
        await Usage.updateOne({ organizationId: req.user.organizationId }, { $inc: { productsCount: -1 } });
      } catch {
        // ignore rollback errors
      }
    }
    res.status(500).json({ message: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ organizationId: req.user.organizationId, isDeleted: false }).lean();
    // Backward compatibility: older docs may not have warehouse stored.
    const normalized = (products ?? []).map((p) => ({ ...p, warehouse: p.warehouse ?? 'Main' }));
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const parsed = updateStockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid update stock payload', errors: parsed.error.flatten() });
    }

    const { stock } = parsed.data;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Backward compatibility for older product docs.
    if (!product.warehouse) product.warehouse = 'Main';

    await logActivity('STOCK_UPDATED', req.user._id, req.user.organizationId, { productId: product._id, stock });

    // Trigger email reminder if low stock.
    if (product.stock <= (product.lowStockThreshold || 5)) {
      await queueLowStockReminder(req.user.email, product);
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const parsedId = objectIdLikeSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const orgId = req.user.organizationId;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Decrement usage count (best-effort).
    await Usage.updateOne({ organizationId: orgId }, { $inc: { productsCount: -1 } });
    await logActivity('PRODUCT_DELETED', req.user._id, orgId, { productId: product._id });

    return res.json({ message: 'Product deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createProduct, getProducts, updateStock, deleteProduct };
