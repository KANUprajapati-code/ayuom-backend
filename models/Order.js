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
  paymentMethod: { type: String, enum: ['COD', 'Prepaid'], default: 'COD' },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
