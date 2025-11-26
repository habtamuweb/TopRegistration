const mongoose = require('mongoose');

const quantitySchema = new mongoose.Schema({
  '8mm': { type: Number, default: 0 },
  '10mm': { type: Number, default: 0 },
  '12mm': { type: Number, default: 0 },
  '14mm': { type: Number, default: 0 },
  '16mm': { type: Number, default: 0 },
  '20mm': { type: Number, default: 0 },
  '24mm': { type: Number, default: 0 },
  '32mm': { type: Number, default: 0 }
});

const factoryPurchaseSchema = new mongoose.Schema({
  factoryName: {
    type: String,
    required: true,
    trim: true
  },
  quantities: {
    type: quantitySchema,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
factoryPurchaseSchema.index({ factoryName: 1, date: -1 });

module.exports = mongoose.model('FactoryPurchase', factoryPurchaseSchema);