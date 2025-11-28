// routes/sales.js
const express = require('express');
const router = express.Router();
const { verifySession, authorize } = require('../middleware/auth');
const Sales = require('../models/Sale');

// Apply session verification to all sales routes
router.use(verifySession);

// GET all sales - accessible by all roles
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching sales for user:', req.user.name);
    const sales = await Sales.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('❌ Error fetching sales:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single sale by ID - accessible by all roles
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new sale - only admin, sales_person
router.post('/', authorize(['admin', 'sales_person']), async (req, res) => {
  try {
    console.log('💰 Creating new sale by:', req.user.name);
    const { customer, plate, fs, date, quantities } = req.body;
    
    // Validate required fields
    if (!customer || !plate || !fs) {
      return res.status(400).json({ message: 'Customer, Plate, and FS Number are required' });
    }

    const sale = new Sales({
      customer,
      plate,
      fs,
      date: date || new Date(),
      quantities: quantities || {}
    });

    const newSale = await sale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update sale - only admin, sales_person
router.put('/:id', authorize(['admin', 'sales_person']), async (req, res) => {
  try {
    const { customer, plate, fs, date, quantities } = req.body;
    
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (customer) sale.customer = customer;
    if (plate) sale.plate = plate;
    if (fs) sale.fs = fs;
    if (date) sale.date = date;
    if (quantities) sale.quantities = quantities;

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH process shipment - only admin, warehouse_manager
router.patch('/:id/ship', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  try {
    const { shippedQuantities } = req.body;
    const saleId = req.params.id;
    
    console.log(`🚚 Processing shipment by ${req.user.name} for sale ${saleId}`);
    
    const sale = await Sales.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Validate shipped quantities
    if (!shippedQuantities || Object.keys(shippedQuantities).length === 0) {
      return res.status(400).json({ message: 'No quantities to ship' });
    }

    let shippedQuantitiesObj = sale.shippedQuantities || {};
    let totalShipped = 0;

    for (const [size, quantity] of Object.entries(shippedQuantities)) {
      const shippedQty = parseInt(quantity);
      if (shippedQty > 0) {
        const orderedQty = sale.quantities[size] || 0;
        const alreadyShipped = shippedQuantitiesObj[size] || 0;
        const remaining = orderedQty - alreadyShipped;
        
        if (remaining > 0) {
          const actualShipped = Math.min(shippedQty, remaining);
          shippedQuantitiesObj[size] = (shippedQuantitiesObj[size] || 0) + actualShipped;
          totalShipped += actualShipped;
        }
      }
    }

    if (totalShipped === 0) {
      return res.status(400).json({ message: 'No valid quantities to ship' });
    }

    sale.shippedQuantities = shippedQuantitiesObj;
    
    // Check if order is complete
    let isComplete = true;
    for (const [size, ordered] of Object.entries(sale.quantities)) {
      const shipped = shippedQuantitiesObj[size] || 0;
      if (shipped < ordered) {
        isComplete = false;
        break;
      }
    }
    
    sale.shipped = isComplete;
    const updatedSale = await sale.save();
    
    console.log(`✅ Successfully shipped ${totalShipped} items by ${req.user.name}`);
    res.json(updatedSale);
    
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE sale - only admin
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Sales.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;