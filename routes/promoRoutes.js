import express from 'express';
import { Coupon } from '../models/Coupon.js';
import { SchemeData } from '../models/SchemeData.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all active coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all active offers (using SchemeData as base)
router.get('/offers', async (req, res) => {
  try {
    const offers = await SchemeData.find({ status: 'Active' });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate a coupon
router.post('/validate-coupon', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or inactive' });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({ message: 'Coupon applied successfully', discount, code: coupon.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
