import express from 'express';
import BulkOrder from '../models/BulkOrder.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new bulk order inquiry
// @route   POST /api/bulk-orders
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { doctorName, clinicName, phone, medicineList, estimatedQuantity } = req.body;
    const newInquiry = await BulkOrder.create({
      doctorName,
      clinicName,
      phone,
      medicineList,
      estimatedQuantity
    });
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all inquiries
// @route   GET /api/bulk-orders
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const inquiries = await BulkOrder.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update inquiry status
// @route   PUT /api/bulk-orders/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const inquiry = await BulkOrder.findById(req.params.id);
    if (inquiry) {
      inquiry.status = req.body.status || inquiry.status;
      inquiry.notes = req.body.notes || inquiry.notes;
      const updatedInquiry = await inquiry.save();
      res.json(updatedInquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete inquiry
// @route   DELETE /api/bulk-orders/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const inquiry = await BulkOrder.findById(req.params.id);
    if (inquiry) {
      await inquiry.deleteOne();
      res.json({ message: 'Inquiry removed' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
