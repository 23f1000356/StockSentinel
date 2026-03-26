const Warehouse = require('../models/Warehouse');
const Usage = require('../models/Usage');
const { z } = require('zod');
const { logActivity } = require('../utils/logger');

const getWarehouses = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    let warehouses = await Warehouse.find({ organizationId: orgId }).lean();

    // Backward compatibility: older tenants may not have a default "Main" warehouse yet.
    if (!warehouses || warehouses.length === 0) {
      const main = await Warehouse.create({ organizationId: orgId, name: 'Main', location: '' });
      await Usage.updateOne({ organizationId: orgId }, { $set: { warehousesCount: 1 } }).catch(() => {});
      warehouses = [main.toObject ? main.toObject() : main];
    }
    return res.json(warehouses);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const warehouseCreateSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1).optional().default(''),
});

const warehouseUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
  })
  .refine((v) => v.name !== undefined || v.location !== undefined, {
    message: 'At least one field (name/location) is required',
  });

const createWarehouse = async (req, res) => {
  try {
    const parsed = warehouseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid warehouse payload', errors: parsed.error.flatten() });
    }

    const orgId = req.user.organizationId;
    const { name, location } = parsed.data;

    // Backfill warehousesCount for older tenants (schema evolution safety).
    const usageDoc = await Usage.findOne({ organizationId: orgId });
    if (usageDoc && typeof usageDoc.warehousesCount !== 'number') {
      const count = await Warehouse.countDocuments({ organizationId: orgId });
      usageDoc.warehousesCount = count;
      await usageDoc.save();
    }

    // Race-condition safe usage increment (claim one slot) similar to product creation.
    let limit = req.plan?.warehouseLimit;
    if (typeof limit !== 'number') {
      const planName = String(req.plan?.name ?? '').toUpperCase();
      if (planName === 'FREE') limit = 1;
      if (planName === 'PRO') limit = -1;
    }
    if (typeof limit === 'number' && limit !== -1) {
      const remainingAllowed = limit - 1;
      const updatedUsage = await Usage.findOneAndUpdate(
        { organizationId: orgId, warehousesCount: { $lte: remainingAllowed } },
        { $inc: { warehousesCount: 1 } },
        { new: true }
      );

      if (!updatedUsage) {
        return res.status(429).json({ message: 'Warehouse limit exceeded' });
      }
    } else {
      // Unlimited (or missing limit): still increment count.
      await Usage.updateOne({ organizationId: orgId }, { $inc: { warehousesCount: 1 } });
    }

    let warehouse;
    try {
      warehouse = await Warehouse.create({ name, location, organizationId: orgId });
    } catch (err) {
      // Rollback usage if warehouse creation fails.
      await Usage.updateOne({ organizationId: orgId }, { $inc: { warehousesCount: -1 } }).catch(() => {});
      throw err;
    }
    await logActivity('WAREHOUSE_CREATED', req.user._id, orgId, {
      warehouseId: warehouse._id,
    });

    return res.status(201).json(warehouse);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const parsed = warehouseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid warehouse update payload', errors: parsed.error.flatten() });
    }

    const orgId = req.user.organizationId;
    const { name, location } = parsed.data;

    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId },
      { ...(name !== undefined ? { name } : {}), ...(location !== undefined ? { location } : {}) },
      { new: true }
    );

    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

    await logActivity('WAREHOUSE_UPDATED', req.user._id, orgId, {
      warehouseId: warehouse._id,
    });

    return res.json(warehouse);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse };

