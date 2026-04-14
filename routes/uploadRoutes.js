import express from 'express';
import { ImageModel } from '../models/Image.js';

const router = express.Router();

// POST upload image (via Base64) to bypass Vercel serverless Multer issues
router.post('/', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    // Parse the base64 string
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid base64 string' });
    }
    
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    // Save to MongoDB
    const newImage = new ImageModel({
      data: buffer,
      contentType: contentType
    });
    
    const savedImage = await newImage.save();
    
    // Return backend URL to view it
    const url = `https://ayuom-backend.vercel.app/api/upload/${savedImage._id}`;
    
    res.status(201).json({ url, id: savedImage._id });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error uploading image to Database', error: error.message });
  }
});

// GET image stream
router.get('/:id', async (req, res) => {
  try {
    const image = await ImageModel.findById(req.params.id);
    if (!image) return res.status(404).send('Image not found');
    
    // Explicit cache headers for Vercel CDN optimizations
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error('Image Fetch Error:', error);
    res.status(500).send('Error fetching image');
  }
});

export default router;
