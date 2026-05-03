import express from 'express';
import { Product } from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get unique list of brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    // Filter out null/empty and return sorted
    const filteredBrands = brands.filter(b => b && b.trim() !== '').sort();
    res.json(filteredBrands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products with filtering
router.get('/', async (req, res) => {
  const { category, brand, minPrice, maxPrice, sort, placement } = req.query;
  
  try {
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = brand;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Placement Logic
    if (placement === 'home') query.showOnHome = true;
    else if (placement === 'schemes') query.showOnSchemes = true;
    else if (placement === 'shop') query.showOnShop = true;

    let mongooseQuery = Product.find(query);
    
    if (req.query.compact === 'true') {
      mongooseQuery = mongooseQuery.select('name stock category image');
    }
    
    let products = await mongooseQuery;
    
    if (sort === 'priceLowHigh') products = products.sort((a,b) => a.price - b.price);
    if (sort === 'priceHighLow') products = products.sort((a,b) => b.price - a.price);
    
    res.json(products);
  } catch (err) {
    console.error('>>> API ERROR during product fetch:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Product (Admin Only)
router.post('/', protect, async (req, res) => {
  try {
    const product = new Product({ 
      ...req.body 
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Product (Admin Only)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
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
