import express from 'express';
import Brand from '../models/Brand.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ status: 'Active' }).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Get All (including inactive)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Brand
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const brand = new Brand({
      ...req.body,
      updatedBy: req.user.id
    });
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Brand
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true }
    );
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Brand
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
