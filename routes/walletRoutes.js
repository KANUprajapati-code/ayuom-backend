import express from 'express';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Wallet details and transaction history
router.get('/my-wallet', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance walletPoints referralCode');
    const transactions = await WalletTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      balance: user.walletBalance,
      points: user.walletPoints,
      referralCode: user.referralCode,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit Withdrawal Request
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    const user = await User.findById(req.user.id);

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const withdrawal = await WithdrawalRequest.create({
      userId: req.user.id,
      amount,
      method,
      details
    });

    // Deduct balance and create transaction
    user.walletBalance -= amount;
    await user.save();

    await WalletTransaction.create({
      userId: req.user.id,
      amount: -amount,
      type: 'Withdrawal',
      description: `Withdrawal request submitted (${method})`,
      referenceId: withdrawal._id,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Convert Points to Balance (1 Point = 1 Rupee)
router.post('/convert-points', protect, async (req, res) => {
    try {
      const { points } = req.body;
      const user = await User.findById(req.user.id);
  
      if (user.walletPoints < points) {
        return res.status(400).json({ message: 'Insufficient points' });
      }
  
      user.walletPoints -= points;
      user.walletBalance += points;
      await user.save();
  
      await WalletTransaction.create({
        userId: req.user.id,
        amount: points,
        type: 'Earned',
        description: `Converted ${points} points to wallet balance`,
        status: 'Completed'
      });
  
      res.json({ message: 'Points converted successfully', balance: user.walletBalance, points: user.walletPoints });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Admin: Get all users wallet info
router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('name email phone clinicName walletBalance walletPoints');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Adjust user balance/points manually
router.post('/admin/adjust-balance/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { type, amount, adjustField, reason } = req.body; // type: 'add'/'deduct', adjustField: 'balance'/'points'
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    let adjustmentAmount = Number(amount);
    if (type === 'deduct') adjustmentAmount = -adjustmentAmount;

    if (adjustField === 'balance') {
      if (type === 'deduct' && user.walletBalance < amount) return res.status(400).json({ message: 'Insufficient balance' });
      user.walletBalance += adjustmentAmount;
    } else {
      if (type === 'deduct' && user.walletPoints < amount) return res.status(400).json({ message: 'Insufficient points' });
      user.walletPoints += adjustmentAmount;
    }

    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      amount: adjustmentAmount,
      type: type === 'add' ? 'Earned' : 'Spent', // Using existing enums best fit
      description: `Admin Adjustment: ${reason} (${adjustField})`,
      status: 'Completed'
    });

    res.json({ message: `Successfully ${type}ed ${amount} ${adjustField}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
