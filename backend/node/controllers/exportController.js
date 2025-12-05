const pdfService = require('../services/pdfService');
const pngService = require('../services/pngService');
const fs = require('fs');

exports.exportToPDF = async (req, res) => {
  try {
    const { graphs, statistics, fileName } = req.body;
    if (!graphs || !statistics) return res.status(400).json({ error: 'Немає даних' });

    const pdfPath = await pdfService.createPDF({ graphs, statistics, fileName });
    
    // ВИПРАВЛЕННЯ: Відправляємо файл і видаляємо після відправки
    res.download(pdfPath, (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
      }
      // Видаляємо файл після завантаження
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting PDF:', unlinkErr);
      });
    });
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Помилка експорту PDF' });
  }
};

exports.exportToPNG = async (req, res) => {
  try {
    const { graphs, fileName } = req.body;
    if (!graphs) return res.status(400).json({ error: 'Немає графіків' });

    const zipPath = await pngService.exportAsZip({ graphs, fileName });
    
    // ВИПРАВЛЕННЯ: Чекаємо завершення створення файлу перед відправкою
    // Перевіряємо що файл існує
    if (!fs.existsSync(zipPath)) {
      throw new Error('ZIP file was not created');
    }

    // Відправляємо файл і видаляємо після відправки
    res.download(zipPath, (err) => {
      if (err) {
        console.error('Error sending ZIP:', err);
      }
      // Видаляємо файл після завантаження
      fs.unlink(zipPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting ZIP:', unlinkErr);
      });
    });
  } catch (err) {
    console.error('PNG export error:', err);
    res.status(500).json({ error: 'Помилка експорту PNG ZIP' });
  }
};