const Activity = require('../models/Activity');

const getRecentActivity = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const logs = await Activity.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      logs: logs.map((l) => ({
        id: l._id,
        action: l.action,
        metadata: l.metadata ?? {},
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRecentActivity };

