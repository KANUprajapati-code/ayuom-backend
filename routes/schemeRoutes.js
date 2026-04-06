import express from 'express';
import { SchemeData } from '../models/SchemeData.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const schemes = await SchemeData.find();
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const scheme = await SchemeData.create(req.body);
    res.status(201).json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const scheme = await SchemeData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await SchemeData.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scheme removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
