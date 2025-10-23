const pythonService = require('../services/pythonService');

exports.analyzeSignal = async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ error: 'fileName обовʼязковий' });
  }

  try {
    const result = await pythonService.runAnalysis(fileName);
    return res.json({ 
      message: 'Аналіз виконано успішно', 
      data: result 
    });
  } catch (err) {
    console.error('Помилка аналізу:', err);
    return res.status(500).json({ error: 'Помилка при обробці файлу Python' });
  }
};
