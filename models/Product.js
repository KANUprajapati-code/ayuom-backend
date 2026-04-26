import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isProductNew: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  showOnShop: { type: Boolean, default: true },
  showOnHome: { type: Boolean, default: false },
  showOnSchemes: { type: Boolean, default: false },
  variants: [{
    name: { type: String, required: true }, // e.g. "30mg", "60mg", "500gm"
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, default: 0 }
  }],
  schemeRules: [{
    minUnits: { type: Number, required: true },
    discountPercentage: { type: Number, required: true }
  }],
  freeUnitsScheme: {
    buy: { type: Number },
    free: { type: Number }
  }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
