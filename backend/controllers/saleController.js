const Sale = require('../models/Sale');

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('❌ Error fetching sales:', error);
    res.status(500).json({ 
      message: 'Error fetching sales', 
      error: error.message 
    });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('❌ Error fetching sale:', error);
    res.status(500).json({ 
      message: 'Error fetching sale', 
      error: error.message 
    });
  }
};

// Create new sale - FIXED VERSION
exports.createSale = async (req, res) => {
  try {
    console.log('📥 Received sale data:', req.body);
    
    const { customer, plate, fs, quantities, date } = req.body;

    // Validate required fields
    if (!customer || customer.trim() === '') {
      return res.status(400).json({ 
        message: 'Customer name is required' 
      });
    }

    if (!plate || plate.trim() === '') {
      return res.status(400).json({ 
        message: 'Plate number is required' 
      });
    }

    if (!fs || fs.trim() === '') {
      return res.status(400).json({ 
        message: 'FS number is required' 
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

    // Format quantities with all sizes
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

    const saleData = {
      customer: customer.trim(),
      plate: plate.trim(),
      fs: fs.trim(),
      quantities: formattedQuantities,
      date: date ? new Date(date) : new Date()
    };

    console.log('💰 Creating sale with data:', saleData);

    const newSale = new Sale(saleData);
    const savedSale = await newSale.save();
    
    console.log('✅ Sale created successfully:', savedSale._id);
    
    res.status(201).json(savedSale);
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating sale', 
      error: error.message 
    });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSale = await Sale.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(updatedSale);
  } catch (error) {
    console.error('❌ Error updating sale:', error);
    res.status(400).json({ 
      message: 'Error updating sale', 
      error: error.message 
    });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSale = await Sale.findByIdAndDelete(id);
    if (!deletedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting sale:', error);
    res.status(500).json({ 
      message: 'Error deleting sale', 
      error: error.message 
    });
  }
};

// Process shipment
exports.processShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippedQuantities } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Update quantities
    Object.keys(shippedQuantities).forEach(size => {
      const shipped = parseInt(shippedQuantities[size]) || 0;
      if (shipped > 0) {
        sale.shippedQuantities[size] = (sale.shippedQuantities[size] || 0) + shipped;
        sale.quantities[size] = Math.max(0, (sale.quantities[size] || 0) - shipped);
      }
    });

    // Update shipment info
    sale.shipmentCount = (sale.shipmentCount || 0) + 1;
    sale.lastShipmentDate = new Date();
    sale.shipped = Object.values(sale.quantities).every(qty => qty === 0);

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    res.status(400).json({ 
      message: 'Error processing shipment', 
      error: error.message 
    });
  }
};

// Get sales statistics
exports.getSalesStats = async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalShipped8mm: { $sum: '$shippedQuantities.8mm' },
          totalShipped10mm: { $sum: '$shippedQuantities.10mm' },
          totalShipped12mm: { $sum: '$shippedQuantities.12mm' },
          totalShipped14mm: { $sum: '$shippedQuantities.14mm' },
          totalShipped16mm: { $sum: '$shippedQuantities.16mm' },
          totalShipped20mm: { $sum: '$shippedQuantities.20mm' },
          totalShipped24mm: { $sum: '$shippedQuantities.24mm' },
          totalShipped32mm: { $sum: '$shippedQuantities.32mm' }
        }
      }
    ]);

    const totals = stats[0] || {
      totalShipped8mm: 0, totalShipped10mm: 0, totalShipped12mm: 0, totalShipped14mm: 0,
      totalShipped16mm: 0, totalShipped20mm: 0, totalShipped24mm: 0, totalShipped32mm: 0
    };

    res.json(totals);
  } catch (error) {
    console.error('❌ Error fetching sales stats:', error);
    res.status(500).json({ 
      message: 'Error fetching sales statistics', 
      error: error.message 
    });
  }
};// Add to your existing saleController.js

// Enhanced processShipment function
exports.processShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippedQuantities } = req.body;

    console.log('🚚 Processing shipment for sale:', id);
    console.log('Shipped quantities:', shippedQuantities);

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Initialize shippedQuantities if not exists
    sale.shippedQuantities = sale.shippedQuantities || {
      '8mm': 0, '10mm': 0, '12mm': 0, '14mm': 0,
      '16mm': 0, '20mm': 0, '24mm': 0, '32mm': 0
    };

    let totalShippedThisTime = 0;
    let hasValidShipment = false;

    // Process each size in the shipment
    Object.keys(shippedQuantities).forEach(size => {
      const shipped = parseInt(shippedQuantities[size]) || 0;
      
      if (shipped > 0) {
        const currentRemaining = sale.quantities[size] || 0;
        const previouslyShipped = sale.shippedQuantities[size] || 0;
        
        // Only ship if there's remaining quantity
        if (currentRemaining > 0) {
          const actualShipped = Math.min(shipped, currentRemaining);
          
          if (actualShipped > 0) {
            sale.shippedQuantities[size] = previouslyShipped + actualShipped;
            sale.quantities[size] = currentRemaining - actualShipped;
            totalShippedThisTime += actualShipped;
            hasValidShipment = true;
          }
        }
      }
    });

    if (!hasValidShipment) {
      return res.status(400).json({ 
        message: 'No valid quantities to ship - check remaining stock' 
      });
    }

    // Update shipment tracking
    sale.shipmentCount = (sale.shipmentCount || 0) + 1;
    sale.lastShipmentDate = new Date();
    
    // Check if order is completely shipped
    const isOrderComplete = Object.values(sale.quantities).every(qty => qty === 0);
    sale.shipped = isOrderComplete;

    const updatedSale = await sale.save();
    
    console.log('✅ Shipment processed successfully:', {
      saleId: updatedSale._id,
      totalShipped: totalShippedThisTime,
      orderComplete: isOrderComplete
    });

    res.json(updatedSale);
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    res.status(500).json({ 
      message: 'Error processing shipment', 
      error: error.message 
    });
  }
};// Enhanced processShipment function - FIXED VERSION
exports.processShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippedQuantities } = req.body;

    console.log('🚚 Processing shipment for sale:', id);
    console.log('Shipped quantities received:', shippedQuantities);

    // Validate input
    if (!shippedQuantities || typeof shippedQuantities !== 'object') {
      return res.status(400).json({ 
        message: 'Shipped quantities must be provided as an object' 
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Initialize shippedQuantities if not exists
    sale.shippedQuantities = sale.shippedQuantities || {};

    let totalShippedThisTime = 0;
    let hasValidShipment = false;

    console.log('📊 Current sale quantities:', sale.quantities);
    console.log('📊 Current shipped quantities:', sale.shippedQuantities);

    // Process each size in the shipment
    Object.keys(shippedQuantities).forEach(size => {
      const shipped = parseInt(shippedQuantities[size]) || 0;
      
      console.log(`🔍 Processing ${size}: requested=${shipped}, currentRemaining=${sale.quantities[size]}`);
      
      if (shipped > 0) {
        const currentRemaining = sale.quantities[size] || 0;
        const previouslyShipped = sale.shippedQuantities[size] || 0;
        
        // Only ship if there's remaining quantity
        if (currentRemaining > 0) {
          const actualShipped = Math.min(shipped, currentRemaining);
          
          if (actualShipped > 0) {
            sale.shippedQuantities[size] = previouslyShipped + actualShipped;
            sale.quantities[size] = currentRemaining - actualShipped;
            totalShippedThisTime += actualShipped;
            hasValidShipment = true;
            
            console.log(`✅ Shipped ${actualShipped} of ${size}, new remaining: ${sale.quantities[size]}`);
          }
        } else {
          console.log(`⏭️ Skipping ${size}: no remaining quantity (${currentRemaining})`);
        }
      }
    });

    if (!hasValidShipment) {
      console.log('❌ No valid shipment: all quantities were zero or no remaining stock');
      return res.status(400).json({ 
        message: 'No valid quantities to ship - check remaining quantities' 
      });
    }

    // Update shipment tracking
    sale.shipmentCount = (sale.shipmentCount || 0) + 1;
    sale.lastShipmentDate = new Date();
    
    // Check if order is completely shipped
    const isOrderComplete = Object.values(sale.quantities).every(qty => qty === 0);
    sale.shipped = isOrderComplete;

    const updatedSale = await sale.save();
    
    console.log('✅ Shipment processed successfully:', {
      saleId: updatedSale._id,
      totalShipped: totalShippedThisTime,
      orderComplete: isOrderComplete
    });

    res.json(updatedSale);
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    res.status(500).json({ 
      message: 'Error processing shipment', 
      error: error.message 
    });
  }
};// Enhanced processShipment function - FIXED VERSION
exports.processShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippedQuantities } = req.body;

    console.log('🚚 Processing shipment for sale:', id);
    console.log('Shipped quantities received:', shippedQuantities);

    // Validate input
    if (!shippedQuantities || typeof shippedQuantities !== 'object') {
      return res.status(400).json({ 
        message: 'Shipped quantities must be provided as an object' 
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Initialize shippedQuantities if not exists
    sale.shippedQuantities = sale.shippedQuantities || {};

    let totalShippedThisTime = 0;
    let hasValidShipment = false;

    console.log('📊 Current sale quantities:', sale.quantities);
    console.log('📊 Current shipped quantities:', sale.shippedQuantities);

    // Process each size in the shipment
    Object.keys(shippedQuantities).forEach(size => {
      const shipped = parseInt(shippedQuantities[size]) || 0;
      
      console.log(`🔍 Processing ${size}: requested=${shipped}, currentRemaining=${sale.quantities[size]}`);
      
      if (shipped > 0) {
        const currentRemaining = sale.quantities[size] || 0;
        const previouslyShipped = sale.shippedQuantities[size] || 0;
        
        // Only ship if there's remaining quantity
        if (currentRemaining > 0) {
          const actualShipped = Math.min(shipped, currentRemaining);
          
          if (actualShipped > 0) {
            sale.shippedQuantities[size] = previouslyShipped + actualShipped;
            sale.quantities[size] = currentRemaining - actualShipped;
            totalShippedThisTime += actualShipped;
            hasValidShipment = true;
            
            console.log(`✅ Shipped ${actualShipped} of ${size}, new remaining: ${sale.quantities[size]}`);
          } else {
            console.log(`⚠️ No shipment for ${size}: actualShipped is 0`);
          }
        } else {
          console.log(`⏭️ Skipping ${size}: no remaining quantity (${currentRemaining})`);
        }
      } else {
        console.log(`⏭️ Skipping ${size}: shipped quantity is 0 or invalid`);
      }
    });

    if (!hasValidShipment) {
      console.log('❌ No valid shipment:');
      console.log('   - Either all quantities were 0');
      console.log('   - Or no remaining quantities available');
      console.log('   - Or invalid input data');
      
      return res.status(400).json({ 
        message: 'No valid quantities to ship. Please check that you entered quantities and that there are remaining items to ship.' 
      });
    }

    // Update shipment tracking
    sale.shipmentCount = (sale.shipmentCount || 0) + 1;
    sale.lastShipmentDate = new Date();
    
    // Check if order is completely shipped
    const isOrderComplete = Object.values(sale.quantities).every(qty => qty === 0);
    sale.shipped = isOrderComplete;

    const updatedSale = await sale.save();
    
    console.log('✅ Shipment processed successfully:', {
      saleId: updatedSale._id,
      totalShipped: totalShippedThisTime,
      orderComplete: isOrderComplete,
      newQuantities: updatedSale.quantities,
      newShippedQuantities: updatedSale.shippedQuantities
    });

    res.json(updatedSale);
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    
    if (error.name === 'MongoTimeoutError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable. Please try again.',
        error: 'Database timeout'
      });
    }
    
    res.status(500).json({ 
      message: 'Error processing shipment', 
      error: error.message 
    });
  }
};