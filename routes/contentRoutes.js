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
      // Create default if it doesn't exist
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
      // IMPORTANT: Prevent Modifying Immutable MongoDB fields
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
    const { title, subtitle, description, imageUrl } = req.body;
    let content = await Content.findOne({ key: req.params.key });

    if (content) {
      content.title = title || content.title;
      content.subtitle = subtitle || content.subtitle;
      content.description = description || content.description;
      content.imageUrl = imageUrl || content.imageUrl;
      content.updatedBy = req.user.id;
      await content.save();
    } else {
      content = new Content({
        key: req.params.key,
        title,
        subtitle,
        description,
        imageUrl,
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
