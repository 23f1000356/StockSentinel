const { Queue } = require('bullmq');

// Define connection with environment variable support.
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_HOST?.includes('upstash.io') ? {} : undefined,
};

const lowStockQueue = new Queue('lowStockEmailQueue', { connection });

const queueLowStockReminder = async (userEmail, product) => {
  try {
    await lowStockQueue.add('sendEmail', {
      to: userEmail,
      productName: product.name,
      stock: product.stock,
      threshold: product.lowStockThreshold,
      warehouse: product.warehouse || 'Main',
    });
    console.log(`Queued email reminder for ${userEmail} regarding ${product.name}`);
  } catch (err) {
    console.error('Failed to queue low stock reminder:', err.message);
  }
};

module.exports = { queueLowStockReminder };
