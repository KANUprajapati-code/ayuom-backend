import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';

dotenv.config();

const products = [
  { name: "Premium Wireless Headphones", price: 2499, originalPrice: 4999, category: "Electronics", rating: 4.8, reviews: 124, isProductNew: true, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", description: "Experience crystal clear sound with our flagship wireless headphones." },
  { name: "Smart Fitness Watch", price: 1899, originalPrice: 3500, category: "Accessories", rating: 4.6, reviews: 89, isProductNew: false, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", description: "Track your health and stay connected." },
  { name: "Ultra HD Action Camera", price: 5499, originalPrice: 8999, category: "Electronics", rating: 4.9, reviews: 56, isProductNew: true, image: "https://images.unsplash.com/photo-1526170315876-ef159c5b18ad?w=800&q=80", description: "Capture every moment." },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedome');
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Database seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
