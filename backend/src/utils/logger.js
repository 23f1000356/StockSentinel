const Activity = require('../models/Activity');

const logActivity = async (action, userId, organizationId, metadata = {}) => {
  try {
    await Activity.create({ action, userId, organizationId, metadata });
  } catch (err) {
    console.error('Logging Error:', err);
  }
};

module.exports = { logActivity };
