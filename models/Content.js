import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  heroBanners: { type: Array, default: [] }, // NEW: Added support for multi-banner sliders
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
