// routes/factoryPurchases.js
const express = require('express');
const router = express.Router();
const { verifySession, authorize } = require('../middleware/auth');
const FactoryPurchase = require('../models/FactoryPurchase');

// Apply session verification to all factory routes
router.use(verifySession);

// GET all factory purchases - accessible by admin, warehouse_manager, manager
router.get('/', authorize(['admin', 'warehouse_manager', 'manager']), async (req, res) => {
  try {
    console.log('🏭 Fetching factory purchases for user:', req.user.name);
    const purchases = await FactoryPurchase.find().sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create factory purchase - only admin, warehouse_manager
router.post('/', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  try {
    console.log('🏭 Creating factory purchase by:', req.user.name);
    const { factoryName, quantities, date } = req.body;

    if (!factoryName || !quantities) {
      return res.status(400).json({ message: 'Factory name and quantities are required' });
    }

    const purchase = new FactoryPurchase({
      factoryName,
      quantities,
      date: date || new Date()
    });

    const newPurchase = await purchase.save();
    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE factory purchase - only admin
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    await FactoryPurchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Factory purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;