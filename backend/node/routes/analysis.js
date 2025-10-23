const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// POST /api/analysis
router.post('/', analysisController.analyzeSignal);

module.exports = router;
