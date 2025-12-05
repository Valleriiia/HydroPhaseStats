const path = require('path');

exports.handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не завантажено' });
  }

  return res.json({
    message: 'Файл успішно завантажено',
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`
  });
};