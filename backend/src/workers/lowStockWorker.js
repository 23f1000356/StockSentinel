const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_HOST?.includes('upstash.io') ? {} : undefined,
};

// Default transporter (re-use env vars if available)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const lowStockWorker = new Worker('lowStockEmailQueue', async (job) => {
  const { to, productName, stock, threshold, warehouse } = job.data;
  const info = await transporter.sendMail({
    from: `"StockSentinel Alerts" <${process.env.SMTP_USER}>`,
    to,
    subject: `🚨 IMMEDIATE ATTENTION: Low Stock Alert for ${productName} [${warehouse}]`,
    text: `URGENT: Low Stock Action Required\n\nYour product "${productName}" in the ${warehouse} warehouse requires immediate attention. It has fallen below the defined threshold.\n\nProduct Details:\n-------------------\nProduct Name: ${productName}\nWarehouse: ${warehouse}\nCurrent Stock: ${stock} units\nThreshold Level: ${threshold} units\n\nAction Required: To avoid stockout and potential disruption to your business, please upgrade/restock this product immediately.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-top: 5px solid #ef4444; border-radius: 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">🚨 URGENT: Low Stock Alert</h2>
        <p>Immediate attention is required for the following product which has fallen below its safety threshold:</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 10px;"><strong>Product Name:</strong> ${productName}</li>
            <li style="margin-bottom: 10px;"><strong>Warehouse Location:</strong> <span style="color: #1a56db; font-weight: bold;">${warehouse}</span></li>
            <li style="margin-bottom: 10px;"><strong>Current Quantity:</strong> <span style="color: #c02d2d; font-weight: bold;">${stock} units</span></li>
            <li style="margin-bottom: 10px;"><strong>Threshold Level:</strong> ${threshold} units</li>
          </ul>
        </div>
        
        <p><strong>Action Required:</strong> To avoid a total stockout, please initiate a restock for the <strong>${warehouse}</strong> warehouse immediately.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6b7280; text-align: center;">
          <p>Sent by StockSentinel Automation System | ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `,
  });
  console.log(`Email job ${job.id} sent: %s`, info.messageId);
}, { connection });

lowStockWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} for ${job.data.productName} completed.`);
});

lowStockWorker.on('failed', (job, err) => {
  console.log(`Email job ${job.id} for ${job.data.productName} failed: ${err.message}`);
});

module.exports = lowStockWorker;
