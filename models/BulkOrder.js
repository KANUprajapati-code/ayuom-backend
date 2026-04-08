import mongoose from 'mongoose';

const bulkOrderSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  clinicName: { type: String, required: true },
  phone: { type: String, required: true },
  medicineList: { type: String, required: true },
  estimatedQuantity: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: { type: String }
}, { timestamps: true });

const BulkOrder = mongoose.model('BulkOrder', bulkOrderSchema);
export default BulkOrder;
