const We = require('../models/We');

// Get all records with filtering
exports.getAllRecords = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const records = await We.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create factory purchase
exports.createFactoryPurchase = async (req, res) => {
  try {
    const { factoryName, quantities, date } = req.body;
    
    const record = new We({
      type: 'factory_purchase',
      factoryName,
      quantities,
      date: date || new Date(),
      createdBy: {
        role: req.user.role,
        username: req.user.username
      }
    });
    
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error creating factory purchase', error: error.message });
  }
};

// Create import purchase
exports.createImportPurchase = async (req, res) => {
  try {
    const { factory, driverName, plateNo, quantities, date } = req.body;
    
    const record = new We({
      type: 'import_purchase',
      factoryName: factory,
      driverName,
      plateNo,
      quantities,
      date: date || new Date(),
      createdBy: {
        role: req.user.role,
        username: req.user.username
      }
    });
    
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error creating import purchase', error: error.message });
  }
};

// Create sale
exports.createSale = async (req, res) => {
  try {
    const { customer, plate, fs, quantities, date } = req.body;
    
    const record = new We({
      type: 'sale',
      customer,
      plateNo: plate,
      fs,
      quantities,
      date: date || new Date(),
      status: 'pending',
      createdBy: {
        role: req.user.role,
        username: req.user.username
      }
    });
    
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error creating sale', error: error.message });
  }
};

// Process shipment
exports.processShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippedQuantities } = req.body;
    
    // Find the sale
    const sale = await We.findById(id);
    if (!sale || sale.type !== 'sale') {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    let totalShipped = 0;
    let hasValidShipment = false;
    
    // Create shipment record
    const shipmentRecord = new We({
      type: 'shipment',
      saleReference: id,
      customer: sale.customer,
      plateNo: sale.plateNo,
      fs: sale.fs,
      shippedQuantities: {},
      date: new Date(),
      createdBy: {
        role: req.user.role,
        username: req.user.username
      }
    });
    
    // Process each size
    Object.keys(shippedQuantities).forEach(size => {
      const shipped = parseInt(shippedQuantities[size]) || 0;
      if (shipped > 0) {
        const ordered = sale.quantities[size] || 0;
        const previouslyShipped = sale.shippedQuantities[size] || 0;
        const remaining = ordered - previouslyShipped;
        
        if (remaining > 0) {
          const actualShipped = Math.min(shipped, remaining);
          shipmentRecord.shippedQuantities[size] = actualShipped;
          totalShipped += actualShipped;
          hasValidShipment = true;
        }
      }
    });
    
    if (!hasValidShipment) {
      return res.status(400).json({ message: 'No valid quantities to ship' });
    }
    
    // Update sale with new shipped quantities
    Object.keys(shipmentRecord.shippedQuantities).forEach(size => {
      sale.shippedQuantities[size] = (sale.shippedQuantities[size] || 0) + shipmentRecord.shippedQuantities[size];
    });
    
    // Check if sale is complete
    let isComplete = true;
    Object.keys(sale.quantities).forEach(size => {
      const ordered = sale.quantities[size] || 0;
      const shipped = sale.shippedQuantities[size] || 0;
      if (shipped < ordered) {
        isComplete = false;
      }
    });
    
    sale.status = isComplete ? 'completed' : 'partial';
    
    // Save both records
    await Promise.all([sale.save(), shipmentRecord.save()]);
    
    res.json({
      sale: sale,
      shipment: shipmentRecord,
      totalShipped: totalShipped
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing shipment', error: error.message });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await We.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await We.aggregate([
      {
        $group: {
          _id: '$type',
          total8mm: { $sum: '$quantities.8mm' },
          total10mm: { $sum: '$quantities.10mm' },
          total12mm: { $sum: '$quantities.12mm' },
          total14mm: { $sum: '$quantities.14mm' },
          total16mm: { $sum: '$quantities.16mm' },
          total20mm: { $sum: '$quantities.20mm' },
          total24mm: { $sum: '$quantities.24mm' },
          total32mm: { $sum: '$quantities.32mm' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate shipped totals
    const shippedStats = await We.aggregate([
      { $match: { type: 'shipment' } },
      {
        $group: {
          _id: null,
          shipped8mm: { $sum: '$shippedQuantities.8mm' },
          shipped10mm: { $sum: '$shippedQuantities.10mm' },
          shipped12mm: { $sum: '$shippedQuantities.12mm' },
          shipped14mm: { $sum: '$shippedQuantities.14mm' },
          shipped16mm: { $sum: '$shippedQuantities.16mm' },
          shipped20mm: { $sum: '$shippedQuantities.20mm' },
          shipped24mm: { $sum: '$shippedQuantities.24mm' },
          shipped32mm: { $sum: '$shippedQuantities.32mm' }
        }
      }
    ]);
    
    const result = {
      factory_purchase: { total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0, total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0, count: 0 },
      import_purchase: { total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0, total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0, count: 0 },
      sale: { total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0, total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0, count: 0 },
      shipment: { total8mm: 0, total10mm: 0, total12mm: 0, total14mm: 0, total16mm: 0, total20mm: 0, total24mm: 0, total32mm: 0, count: 0 },
      shipped: shippedStats[0] || {
        shipped8mm: 0, shipped10mm: 0, shipped12mm: 0, shipped14mm: 0,
        shipped16mm: 0, shipped20mm: 0, shipped24mm: 0, shipped32mm: 0
      }
    };
    
    stats.forEach(stat => {
      if (result[stat._id]) {
        result[stat._id] = { ...stat };
      }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get sales with remaining quantities
exports.getSalesWithRemaining = async (req, res) => {
  try {
    const sales = await We.find({ type: 'sale', status: { $in: ['pending', 'partial'] } })
      .sort({ date: -1 });
    
    const salesWithRemaining = sales.map(sale => {
      const remainingQuantities = {};
      Object.keys(sale.quantities).forEach(size => {
        const ordered = sale.quantities[size] || 0;
        const shipped = sale.shippedQuantities[size] || 0;
        remainingQuantities[size] = Math.max(0, ordered - shipped);
      });
      
      return {
        ...sale.toObject(),
        remainingQuantities
      };
    });
    
    res.json(salesWithRemaining);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales with remaining', error: error.message });
  }
};

// Get last update timestamp
exports.getLastUpdate = async (req, res) => {
  try {
    const lastRecord = await We.findOne().sort({ updatedAt: -1 });
    res.json({ 
      lastUpdate: lastRecord ? lastRecord.updatedAt : new Date(0),
      recordCount: await We.countDocuments() 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};