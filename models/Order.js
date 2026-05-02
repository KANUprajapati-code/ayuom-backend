import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    variantName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  codCharge: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['COD', 'Prepaid'], default: 'COD' },
  status: { type: String, default: 'Pending' },
  pointsToAward: { type: Number, default: 0 },
  pointsAwarded: { type: Boolean, default: false }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
