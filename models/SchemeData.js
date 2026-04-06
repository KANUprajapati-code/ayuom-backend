import mongoose from 'mongoose';

const schemeDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'Zap' }, // 'TrendingDown', 'Zap', 'ShieldCheck'
  color: { type: String, default: 'emerald' }, // 'emerald', 'blue', 'purple', 'orange'
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export const SchemeData = mongoose.model('SchemeData', schemeDataSchema);
