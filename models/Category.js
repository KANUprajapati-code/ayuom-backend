import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: "" },
  brands: [{ type: String }],
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
