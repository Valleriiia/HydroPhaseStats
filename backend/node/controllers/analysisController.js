const pythonService = require('../services/pythonService');

exports.analyzeSignal = async (req, res) => {
  const { fileName, options } = req.body; // Отримуємо options
  
  if (!fileName) {
    return res.status(400).json({ error: 'fileName обовʼязковий' });
  }

  try {
    // Передаємо options далі у сервіс
    const result = await pythonService.runAnalysis(fileName, options);
    return res.json({ 
      message: 'Аналіз виконано успішно', 
      data: result 
    });
  } catch (err) {
    console.error('Помилка аналізу:', err);
    return res.status(500).json({ error: 'Помилка при обробці файлу Python' });
  }
};