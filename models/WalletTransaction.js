import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['Earned', 'Referral', 'Withdrawal', 'Spent', 'Refund'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Rejected'], 
    default: 'Completed' 
  },
  description: { type: String },
  referenceId: { type: String }, // Order ID or Withdrawal ID
}, { timestamps: true });

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
