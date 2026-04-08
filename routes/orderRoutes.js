import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all orders for the logged-in user
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order (Record WhatsApp attempts and decrement stock)
router.post('/', protect, async (req, res) => {
  try {
    const { products } = req.body;
    
    // Create the order
    const newOrder = new Order({
      ...req.body,
      userId: req.user.id
    });
    const savedOrder = await newOrder.save();

    // Decrement stock for each product
    if (products && Array.isArray(products)) {
      for (const item of products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -Math.abs(item.quantity) } },
          { new: true }
        );
      }
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
