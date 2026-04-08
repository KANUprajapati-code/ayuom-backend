import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, clinicName, phone, medicalRegId } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ 
      name, 
      email, 
      password, 
      clinicName, 
      phone,
      medicalRegId,
      isApproved: false // Requires admin approval before login
    });
    
    await user.save();
    res.status(201).json({ message: 'Registration successful. Your account is under review by our medical verification team. You will be able to log in once approved.' });
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

export default router;
