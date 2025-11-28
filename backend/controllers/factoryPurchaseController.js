const FactoryPurchase = require('../models/FactoryPurchase');

// Get all factory purchases
exports.getAllFactoryPurchases = async (req, res) => {
  try {
    const purchases = await FactoryPurchase.find().sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new factory purchase
exports.createFactoryPurchase = async (req, res) => {
  try {
    const { factoryName, quantities, date } = req.body;
    
    const newPurchase = new FactoryPurchase({
      factoryName,
      quantities,
      date: date || new Date()
    });

    const savedPurchase = await newPurchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(400).json({ message: 'Error creating purchase', error: error.message });
  }
};

// Delete factory purchase
exports.deleteFactoryPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPurchase = await FactoryPurchase.findByIdAndDelete(id);
    if (!deletedPurchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json({ message: 'Factory purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get factory purchase statistics
exports.getFactoryStats = async (req, res) => {
  try {
    const stats = await FactoryPurchase.aggregate([
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
          total32mm: { $sum: '$quantities.32mm' }
        }
      }
    ]);

    const totals = stats[0] || {
      total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0,
      total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0
    };

    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};