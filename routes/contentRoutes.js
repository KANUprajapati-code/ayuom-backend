import express from 'express';
import Content from '../models/Content.js';
import HomePageContent from '../models/HomePageContent.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get home page content
router.get('/homepage', async (req, res) => {
  try {
    let content = await HomePageContent.findOne();
    if (!content) {
      content = await HomePageContent.create({});
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update home page content (Admin only)
router.put('/homepage', protect, adminOnly, async (req, res) => {
  try {
    let content = await HomePageContent.findOne();
    if (!content) {
      content = new HomePageContent(req.body);
    } else {
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.__v;
      Object.assign(content, updateData);
    }
    content.updatedBy = req.user.id;
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get content by key
router.get('/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    if (!content) {
      return res.status(200).json(null);
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update content by key (Admin only)
router.put('/:key', protect, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Prevent accidental key change or ID modification
    delete updateData._id;
    delete updateData.__v;
    delete updateData.key;

    let content = await Content.findOne({ key: req.params.key });

    if (content) {
      // Flexible update - merges all fields from frontend
      Object.assign(content, updateData);
      content.updatedBy = req.user.id;
      await content.save();
    } else {
      content = new Content({
        key: req.params.key,
        ...updateData,
        updatedBy: req.user.id
      });
      await content.save();
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
