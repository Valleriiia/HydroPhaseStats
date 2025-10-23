const express = require('express');
const path = require('path');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');

const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));


// Доступ до завантажених файлів (як статику)
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

app.use('/api/upload', uploadRoutes);

app.use('/api/export', exportRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
