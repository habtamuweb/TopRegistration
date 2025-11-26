// routes/purchases.js
const express = require('express');
const router = express.Router();
const { verifySession, authorize } = require('../middleware/auth');
const Purchase = require('../models/Purchase');

// Apply session verification to all purchase routes
router.use(verifySession);

// GET all purchases - accessible by admin, warehouse_manager, manager
router.get('/', authorize(['admin', 'warehouse_manager', 'manager']), async (req, res) => {
  try {
    console.log('📦 Fetching purchases for user:', req.user.name);
    const purchases = await Purchase.find().sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create purchase - only admin, warehouse_manager
router.post('/', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  try {
    console.log('🛒 Creating purchase by:', req.user.name);
    const { factory, driverName, plateNo, quantities, date } = req.body;

    // Validate required fields
    if (!factory || !quantities) {
      return res.status(400).json({ message: 'Factory and quantities are required' });
    }

    const purchase = new Purchase({
      factory,
      driverName: driverName || '',
      plateNo: plateNo || '',
      quantities,
      date: date || new Date()
    });

    const newPurchase = await purchase.save();
    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE purchase - only admin
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;