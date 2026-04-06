import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'products', 'schemes', 'text'],
    required: true
  },
  title: String,
  subtitle: String,
  category: String, // For 'products' type to filter by category
  content: String,  // For 'text' type
  active: { type: Boolean, default: true }
}, { _id: true });

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  sections: [sectionSchema],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Page = mongoose.model('Page', pageSchema);
