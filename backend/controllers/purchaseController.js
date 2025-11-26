const Purchase = require('../models/Purchase');

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ date: -1 });
    console.log(`✅ Fetched ${purchases.length} purchases`);
    res.json(purchases);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    res.status(500).json({ 
      message: 'Error fetching purchases', 
      error: error.message 
    });
  }
};

// Create new purchase - ENHANCED VERSION
exports.createPurchase = async (req, res) => {
  try {
    console.log('📥 Received purchase request body:', req.body);
    
    const { factory, driverName, plateNo, quantities, date } = req.body;

    // Validate required fields
    if (!factory || factory.trim() === '') {
      return res.status(400).json({ 
        message: 'Factory name is required' 
      });
    }

    // Validate quantities
    if (!quantities || typeof quantities !== 'object') {
      return res.status(400).json({ 
        message: 'Quantities must be provided as an object' 
      });
    }

    // Ensure all quantity fields are numbers and at least one quantity > 0
    const quantityEntries = Object.entries(quantities);
    const hasValidQuantity = quantityEntries.some(([key, value]) => {
      const numValue = parseInt(value);
      return !isNaN(numValue) && numValue > 0;
    });

    if (!hasValidQuantity) {
      return res.status(400).json({ 
        message: 'At least one quantity must be greater than 0' 
      });
    }

    // Format quantities with all sizes and ensure they are numbers
    const formattedQuantities = {
      '8mm': parseInt(quantities['8mm']) || 0,
      '10mm': parseInt(quantities['10mm']) || 0,
      '12mm': parseInt(quantities['12mm']) || 0,
      '14mm': parseInt(quantities['14mm']) || 0,
      '16mm': parseInt(quantities['16mm']) || 0,
      '20mm': parseInt(quantities['20mm']) || 0,
      '24mm': parseInt(quantities['24mm']) || 0,
      '32mm': parseInt(quantities['32mm']) || 0
    };

    // Create purchase data with ALL fields
    const purchaseData = {
      factory: factory.trim(),
      driverName: driverName ? driverName.trim() : '', // Always include, even if empty
      plateNo: plateNo ? plateNo.trim() : '', // Always include, even if empty
      quantities: formattedQuantities,
      date: date ? new Date(date) : new Date()
    };

    console.log('🛒 Creating purchase with complete data:', purchaseData);

    const newPurchase = new Purchase(purchaseData);
    const savedPurchase = await newPurchase.save();
    
    console.log('✅ Purchase created successfully:', {
      id: savedPurchase._id,
      factory: savedPurchase.factory,
      driverName: savedPurchase.driverName,
      plateNo: savedPurchase.plateNo,
      quantities: savedPurchase.quantities,
      date: savedPurchase.date
    });
    
    res.status(201).json(savedPurchase);
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating purchase', 
      error: error.message 
    });
  }
};

// Delete purchase
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPurchase = await Purchase.findByIdAndDelete(id);
    if (!deletedPurchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    console.log('✅ Purchase deleted:', id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    res.status(500).json({ 
      message: 'Error deleting purchase', 
      error: error.message 
    });
  }
};

// Get purchase statistics
exports.getPurchaseStats = async (req, res) => {
  try {
    const stats = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total8mm: { $sum: '$quantities.8mm' },
          total10mm: { $sum: '$quantities.10mm' },
          total12mm: { $sum: '$quantities.12mm' },
          total14mm: { $sum: '$quantities.14mm' },
          total16mm: { $sum: '$quantities.16mm' },
          total20mm: { $sum: '$quantities.20mm' },
          total24mm: { $sum: '$quantities.24mm' },
          total32mm: { $sum: '$quantities.32mm' },
          totalPurchases: { $sum: 1 },
          uniqueFactories: { $addToSet: '$factory' }
        }
      }
    ]);

    const totals = stats[0] || {
      total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0,
      total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0,
      totalPurchases: 0,
      uniqueFactories: []
    };

    // Add count of unique factories
    totals.uniqueFactoryCount = totals.uniqueFactories ? totals.uniqueFactories.length : 0;

    res.json(totals);
  } catch (error) {
    console.error('❌ Error fetching purchase stats:', error);
    res.status(500).json({ 
      message: 'Error fetching purchase statistics', 
      error: error.message 
    });
  }
};