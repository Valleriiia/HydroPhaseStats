const pdfService = require('../services/pdfService');
const pngService = require('../services/pngService');

exports.exportToPDF = async (req, res) => {
  try {
    const { graphs, statistics, fileName } = req.body;
    if (!graphs || !statistics) return res.status(400).json({ error: 'Немає даних' });

    const pdfPath = await pdfService.createPDF({ graphs, statistics, fileName });
    return res.download(pdfPath);
  } catch (err) {
    res.status(500).json({ error: 'Помилка експорту PDF' });
  }
};

exports.exportToPNG = async (req, res) => {
  try {
    const { graphs, fileName } = req.body;
    if (!graphs) return res.status(400).json({ error: 'Немає графіків' });

    const zipPath = await pngService.exportAsZip({ graphs, fileName });
    return res.download(zipPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка експорту PNG ZIP' });
  }
};
