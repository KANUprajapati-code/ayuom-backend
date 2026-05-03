import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import Admin from '../models/Admin.js';

import { WalletTransaction } from '../models/WalletTransaction.js';
import crypto from 'crypto';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, clinicName, phone, medicalRegId, referredByCode } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Generate unique referral code
    let referralCode;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      referralCode = name.substring(0, 3).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
      const existingCode = await User.findOne({ referralCode });
      if (!existingCode) isCodeUnique = true;
    }

    let referredByUser = null;
    if (referredByCode) {
      referredByUser = await User.findOne({ referralCode: referredByCode });
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      clinicName, 
      phone,
      medicalRegId,
      referralCode,
      referredBy: referredByUser ? referredByUser._id : null,
      isApproved: false // Requires admin approval before login
    });
    
    const savedUser = await user.save();

    // Award bonus points if referred
    if (referredByUser) {
      // Award to Referrer
      referredByUser.walletPoints += 50;
      await referredByUser.save();
      
      await WalletTransaction.create({
        userId: referredByUser._id,
        amount: 50,
        type: 'Referral',
        description: `Referral bonus for inviting ${name}`,
        status: 'Completed'
      });

      // Award to Referee
      savedUser.walletPoints += 50;
      await savedUser.save();

      await WalletTransaction.create({
        userId: savedUser._id,
        amount: 50,
        type: 'Referral',
        description: `Welcome bonus for using referral code from ${referredByUser.name}`,
        status: 'Completed'
      });
    }

    res.status(201).json({ message: 'Registration successful. Your account is under review. You will be able to log in once approved.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // First, check the User collection
    let user = await User.findOne({ email });
    let role = user ? user.role : null;
    let isApproved = user ? user.isApproved : false;
    let isValidUser = user ? await user.comparePassword(password) : false;

    // If not found or invalid in User, check Admin
    if (!user || !isValidUser) {
      const admin = await Admin.findOne({ email });
      if (admin && await admin.comparePassword(password)) {
        user = admin;
        role = 'admin';
        isApproved = true; // Admins are always approved
        isValidUser = true;
      }
    }

    if (!user || !isValidUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!isApproved && role !== 'admin') {
      return res.status(403).json({ message: 'Account pending admin approval.' });
    }

    const token = jwt.sign(
      { id: user._id, role: role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.clinicName = req.body.clinicName || user.clinicName;
    
    // Email update could require re-verification, let's keep it simple for now
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
      user.email = req.body.email;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      clinicName: updatedUser.clinicName,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change Password
router.put('/profile/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Profile Data
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new address
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = {
      customerName: req.body.customerName,
      phone: req.body.phone,
      fullAddress: req.body.fullAddress,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      isDefault: req.body.isDefault || false
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
