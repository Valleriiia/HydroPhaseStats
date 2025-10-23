const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const fileUpload = require('../middleware/fileUpload');

// POST /api/upload
router.post('/', fileUpload.single('audio'), uploadController.handleUpload);

module.exports = router;