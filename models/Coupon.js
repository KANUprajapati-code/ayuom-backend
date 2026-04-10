import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // Only for Percentage
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number },
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);
