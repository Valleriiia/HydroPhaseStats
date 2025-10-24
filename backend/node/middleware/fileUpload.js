const multer = require('multer');
const path = require('path');

// Налаштування сховища
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../data/uploads')); // зберігати в /data/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Фільтр файлів (дозволяємо тільки аудіо)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Непідтримуваний формат файлу'), false);
  }
  cb(null, true);
};

// Експорт middleware
module.exports = multer({ storage, fileFilter });
