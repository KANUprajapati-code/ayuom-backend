import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';

dotenv.config();

const products = [
  { 
    name: "Augmentin 625 Duo Tablet", 
    price: 185, 
    originalPrice: 201, 
    category: "Antibiotics", 
    description: "Amoxycillin (500mg) + Clavulanic Acid (125mg). Used to treat bacterial infections of the lungs, urinary tract, and skin.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    stock: 50,
    showOnShop: true,
    showOnHome: true,
    showOnSchemes: true
  },
  { 
    name: "Pan 40mg Tablet", 
    price: 145, 
    originalPrice: 160, 
    category: "Gastrointestinal", 
    description: "Pantoprazole (40mg). Reduces the amount of acid produced in your stomach. Used for heartburn, acid reflux, and peptic ulcer disease.",
    image: "https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?w=800&q=80",
    stock: 100,
    showOnShop: true,
    showOnHome: true,
    showOnSchemes: false
  },
  { 
    name: "Calpol 650mg Tablet", 
    price: 30, 
    originalPrice: 35, 
    category: "Analgesic", 
    description: "Paracetamol (650mg). Used for pain relief and fever.",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&q=80",
    stock: 200,
    showOnShop: true,
    showOnHome: false,
    showOnSchemes: true
  },
  { 
    name: "Telma 40mg Tablet", 
    price: 85, 
    originalPrice: 95, 
    category: "Cardiac", 
    description: "Telmisartan (40mg). Used to treat high blood pressure and prevent heart attack and stroke.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    stock: 75,
    showOnShop: true,
    showOnHome: true,
    showOnSchemes: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB under URI: ' + process.env.MONGODB_URI);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Old records cleared.');

    // Insert new products
    await Product.insertMany(products);
    console.log('Database seeded with medical products!');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
