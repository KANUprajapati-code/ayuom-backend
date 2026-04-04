import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serverless MongoDB Connection Middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  
  if (mongoose.connection.readyState === 2) {
    // Already connecting, just proceed and let Mongoose buffer
    return next();
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedome', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB (Serverless cold start)');
    next();
  } catch (err) {
    console.error('MongoDB connection error on initial load:', err);
    res.status(500).json({ message: 'Database connecting error. Please check IP Whitelist.', error: err.message });
  }
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Wedome API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
