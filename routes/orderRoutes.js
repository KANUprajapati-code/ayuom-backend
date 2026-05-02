import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

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

    // Award points (10% of totalAmount)
    const pointsEarned = Math.floor(savedOrder.totalAmount * 0.1);
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletPoints: pointsEarned }
      });

      await WalletTransaction.create({
        userId: req.user.id,
        amount: pointsEarned,
        type: 'Earned',
        description: `Points earned from Order #${savedOrder._id.toString().substring(18)}`,
        referenceId: savedOrder._id,
        status: 'Completed'
      });
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Get all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
