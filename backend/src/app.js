require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const activityRoutes = require('./routes/activityRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { ensureDefaultAdmin } = require('./utils/ensureDefaultAdmin');
require('./workers/lowStockWorker');

const app = express();

// Middleware
// Deployment: Enable CORS for all origins for demo purposes
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', premiumRoutes);
app.use('/api', warehouseRoutes);
app.use('/api', userRoutes);
app.use('/api', activityRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

// Connect DB then ensure a default admin exists
connectDB()
  .then(async () => {
    try {
      await ensureDefaultAdmin();
    } catch (err) {
      console.error('Failed to ensure default admin:', err.message);
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
