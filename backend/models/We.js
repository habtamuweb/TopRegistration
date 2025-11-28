const mongoose = require('mongoose');

// Unified schema for all operations
const weSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['factory_purchase', 'import_purchase', 'sale', 'shipment']
  },
  
  // Common fields
  factoryName: { type: String, trim: true },
  customer: { type: String, trim: true },
  driverName: { type: String, trim: true, default: '' },
  plateNo: { type: String, trim: true, default: '' },
  fs: { type: String, trim: true, default: '' },
  
  // Quantities for different operations
  quantities: {
    '8mm': { type: Number, default: 0, min: 0 },
    '10mm': { type: Number, default: 0, min: 0 },
    '12mm': { type: Number, default: 0, min: 0 },
    '14mm': { type: Number, default: 0, min: 0 },
    '16mm': { type: Number, default: 0, min: 0 },
    '20mm': { type: Number, default: 0, min: 0 },
    '24mm': { type: Number, default: 0, min: 0 },
    '32mm': { type: Number, default: 0, min: 0 }
  },
  
  // For shipments - tracks what was shipped
  shippedQuantities: {
    '8mm': { type: Number, default: 0, min: 0 },
    '10mm': { type: Number, default: 0, min: 0 },
    '12mm': { type: Number, default: 0, min: 0 },
    '14mm': { type: Number, default: 0, min: 0 },
    '16mm': { type: Number, default: 0, min: 0 },
    '20mm': { type: Number, default: 0, min: 0 },
    '24mm': { type: Number, default: 0, min: 0 },
    '32mm': { type: Number, default: 0, min: 0 }
  },
  
  // Reference to original sale for shipments
  saleReference: { type: mongoose.Schema.Types.ObjectId, ref: 'We' },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'partial', 'cancelled'],
    default: 'pending'
  },
  
  // User who created the record
  createdBy: {
    role: String,
    username: String
  }
}, {
  timestamps: true
});

// Index for better performance
weSchema.index({ type: 1, date: -1 });
weSchema.index({ saleReference: 1 });

module.exports = mongoose.model('We', weSchema, 'we');