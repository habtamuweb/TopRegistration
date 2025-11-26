const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  factory: {
    type: String,
    required: [true, 'Factory name is required'],
    trim: true
  },
  driverName: {
    type: String,
    trim: true,
    default: ''
  },
  plateNo: {
    type: String,
    trim: true,
    default: ''
  },
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  shipped: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index
purchaseSchema.index({ factory: 1, date: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);