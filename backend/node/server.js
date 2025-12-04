const express = require('express');
const path = require('path');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis'); // <--- 1. ДОДАЙ ЦЕ
const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ДОДАЙ ЦЕ ===========================================
app.get('/', (req, res) => {
  res.json({
    message: 'HydroPhaseStats API Server',
    version: '1.0.0',
    status: 'running',
   endpoints: {
    upload: 'POST /api/upload',
    analyze: 'POST /api/analysis', // <--- Було /analyze, має бути просто /api/analysis
    export: 'POST /api/export/pdf' // (або png)
  }
  });
});
// ===================================================

// Доступ до завантажених файлів (як статику)
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/export', exportRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});