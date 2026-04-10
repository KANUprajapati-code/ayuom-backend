import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true, default: 'UPI' },
  details: { type: String, required: true }, // UPI ID or Bank Details
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminNote: { type: String },
}, { timestamps: true });

export const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
