const express = require('express');
const router = express.Router();
const { verifySession, authorize } = require('../middleware/auth');
const weController = require('../controllers/weController');

// Apply session verification to all routes
router.use(verifySession);

// GET all records with optional filtering
router.get('/', async (req, res) => {
  await weController.getAllRecords(req, res);
});

// GET last update
router.get('/last-update', async (req, res) => {
  await weController.getLastUpdate(req, res);
});

// GET statistics
router.get('/stats', async (req, res) => {
  await weController.getStatistics(req, res);
});

// GET sales with remaining quantities
router.get('/sales/remaining', async (req, res) => {
  await weController.getSalesWithRemaining(req, res);
});

// POST factory purchase - only admin, warehouse_manager
router.post('/factory', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  await weController.createFactoryPurchase(req, res);
});

// POST import purchase - only admin, warehouse_manager
router.post('/purchase', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  await weController.createImportPurchase(req, res);
});

// POST sale - only admin, sales_person
router.post('/sale', authorize(['admin', 'sales_person']), async (req, res) => {
  await weController.createSale(req, res);
});

// PATCH process shipment - only admin, warehouse_manager
router.patch('/sale/:id/ship', authorize(['admin', 'warehouse_manager']), async (req, res) => {
  await weController.processShipment(req, res);
});

// DELETE record - only admin
router.delete('/:id', authorize(['admin']), async (req, res) => {
  await weController.deleteRecord(req, res);
});

module.exports = router;