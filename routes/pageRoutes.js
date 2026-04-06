import express from 'express';
import { Page } from '../models/Page.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all active pages for navigation
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ active: true }).select('title slug');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Get a specific page by slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, active: true });
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all pages including inactive
router.get('/admin/all', protect, async (req, res) => {
  try {
    const pages = await Page.find().sort('-createdAt');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create new page
router.post('/', protect, async (req, res) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update page
router.put('/:id', protect, async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete page
router.delete('/:id', protect, async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
