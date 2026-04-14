import express from 'express';
import multer from 'multer';
import { ImageModel } from '../models/Image.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST upload image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Save to MongoDB
    const newImage = new ImageModel({
      data: req.file.buffer,
      contentType: req.file.mimetype
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
