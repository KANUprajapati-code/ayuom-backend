import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      admin = await Admin.findOne({ email });
    }
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    res.json({ 
      token, 
      admin: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Pending Users
router.get('/users/pending', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false, role: 'user' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Users
router.get('/users/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve User
router.put('/users/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Role (Promote to Admin)
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manually Add Wallet Points
router.put('/users/:id/wallet', protect, adminOnly, async (req, res) => {
  try {
    const { points, description } = req.body;
    const amount = Number(points);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { $inc: { walletBalance: amount } }, 
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    await WalletTransaction.create({
      userId: user._id,
      amount: amount,
      type: 'Earned',
      description: description || 'Cash balance credited by Administrator',
      status: 'Completed'
    });

    res.json({ message: `Successfully added ${amount} points to ${user.name}'s wallet`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject/Delete User
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    // Check in User model first
    let admin = await User.findById(req.user.id).select('-password');
    if (!admin) {
      admin = await Admin.findById(req.user.id).select('-password');
    }
    res.json(admin);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
