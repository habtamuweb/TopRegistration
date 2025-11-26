const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
    trim: true
  },
  plate: {
    type: String,
    required: true,
    trim: true
  },
  fs: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  quantities: {
    type: Object,
    default: {}
  },
  shippedQuantities: {
    type: Object,
    default: {}
  },
  shipped: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Convert to plain object for frontend
salesSchema.methods.toJSON = function() {
  const salesObject = this.toObject();
  
  // Ensure quantities and shippedQuantities are plain objects
  if (salesObject.quantities instanceof Map) {
    salesObject.quantities = Object.fromEntries(salesObject.quantities);
  }
  if (salesObject.shippedQuantities instanceof Map) {
    salesObject.shippedQuantities = Object.fromEntries(salesObject.shippedQuantities);
  }
  
  return salesObject;
};

module.exports = mongoose.model('Sales', salesSchema);