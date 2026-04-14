import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
}, { timestamps: true });

export const ImageModel = mongoose.model('Image', imageSchema);
