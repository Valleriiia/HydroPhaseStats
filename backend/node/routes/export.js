const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// POST /api/export/pdf
router.post('/pdf', exportController.exportToPDF);
router.post('/png', exportController.exportToPNG);

module.exports = router;
