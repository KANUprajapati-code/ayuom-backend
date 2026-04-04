import express from 'express';
import { Product } from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

const mockProducts = [
  { _id: '1', name: "Paracetamol 500mg (10 tabs)", price: 40, originalPrice: 60, category: "Medicines", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80", description: "Standard pain relief for fever and aches." },
  { _id: '2', name: "B-Complex Vitamin Tablets", price: 120, originalPrice: 150, category: "Medicines", image: "https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?w=800&q=80", description: "Supports energy metabolism and nervous system health." },
  { _id: '3', name: "Premium Multivitamin Complex", price: 899, originalPrice: 1200, category: "Wellness", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&q=80", description: "Complete daily nutrition with essential minerals." },
  { _id: '4', name: "Digital Blood Pressure Monitor", price: 1899, originalPrice: 3500, category: "Devices", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80", description: "Accurate health monitoring at home." },
  { _id: '5', name: "Pure Himalayan Shilajit (20g)", price: 2999, originalPrice: 3500, category: "Ayurveda", image: "https://images.unsplash.com/photo-1611082216001-f2549a16f9f6?w=800&q=80", description: "Traditional Ayurvedic energy and vitality booster." }
];

// Helper to handle results
const sendProducts = (res, products, category) => {
  let filtered = products;
  if (category && category !== 'All') {
    filtered = products.filter(p => p.category === category);
  }
  return res.json(filtered);
};

// Get all products
router.get('/', async (req, res) => {
  const { category, minPrice, maxPrice, sort, placement } = req.query;
  
  try {


    let query = {};
    if (category && category !== 'All') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Placement Logic
    if (placement === 'home') query.showOnHome = true;
    else if (placement === 'schemes') query.showOnSchemes = true;
    else if (placement === 'shop') query.showOnShop = true;

    let products = await Product.find(query);
    
    // Fallback to mock if empty (just for demo purposes)
    if (products.length === 0) {
       console.log('>>> DB connected but empty. Serving MOCK DATA.');
       return sendProducts(res, mockProducts, category);
    }

    if (sort === 'priceLowHigh') products = products.sort((a,b) => a.price - b.price);
    if (sort === 'priceHighLow') products = products.sort((a,b) => b.price - a.price);
    
    res.json(products);
  } catch (err) {
    console.error('>>> API ERROR during product fetch:', err.message);
    return sendProducts(res, mockProducts, category);
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);
    if (!product) {
      const p = mockProducts.find(p => p._id === req.params.id);
      return p ? res.json(p) : res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    const p = mockProducts.find(p => p._id === req.params.id);
    return p ? res.json(p) : res.status(500).json({ message: err.message });
  }
});

// Create Product (Admin Only)
router.post('/', protect, async (req, res) => {
  const { name, price, originalPrice, category, image, description, showOnShop, showOnHome, showOnSchemes } = req.body;
  try {
    const product = new Product({ name, price, originalPrice, category, image, description, showOnShop, showOnHome, showOnSchemes });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Product (Admin Only)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Product (Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
