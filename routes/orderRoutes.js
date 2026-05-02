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
    const { products, pointsUsed } = req.body;

    // Handle wallet points redemption
    if (pointsUsed && pointsUsed > 0) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc.walletPoints < pointsUsed) {
        return res.status(400).json({ message: 'Insufficient wallet points' });
      }
      
      // Deduct points
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletPoints: -pointsUsed }
      });

      // Record transaction
      await WalletTransaction.create({
        userId: req.user.id,
        amount: pointsUsed,
        type: 'Spent',
        description: `Points redeemed for order`,
        status: 'Completed'
      });
    }
    
    // Decrement stock and calculate points dynamically based on product settings
    let pointsEarned = 0;
    if (products && Array.isArray(products)) {
      for (const item of products) {
        const dbProduct = await Product.findById(item.productId);
        if (dbProduct) {
          // Decrement stock
          dbProduct.stock -= Math.abs(item.quantity);
          await dbProduct.save();

          // Calculate points if product has cashback percentage
          if (dbProduct.walletCashbackPercentage && dbProduct.walletCashbackPercentage > 0) {
            const itemTotal = item.price * item.quantity;
            pointsEarned += Math.floor((itemTotal * dbProduct.walletCashbackPercentage) / 100);
          }
        }
      }
    }
    
    // Create the order
    const newOrder = new Order({
      ...req.body,
      userId: req.user.id,
      pointsToAward: pointsEarned
    });
    const savedOrder = await newOrder.save();

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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    
    // Award points if marked as Delivered for the first time
    if (status === 'Delivered' && !order.pointsAwarded && order.pointsToAward > 0) {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { walletPoints: order.pointsToAward }
      });

      await WalletTransaction.create({
        userId: order.userId,
        amount: order.pointsToAward,
        type: 'Earned',
        description: `Points earned from Order #${order._id.toString().substring(18)} (Delivered)`,
        referenceId: order._id,
        status: 'Completed'
      });
      
      order.pointsAwarded = true;
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
