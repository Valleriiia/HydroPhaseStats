const analysisController = require('../controllers/analysisController');
const pythonService = require('../services/pythonService');

// Мокаємо pythonService
jest.mock('../services/pythonService');

describe('analysisController.analyzeSignal', () => {
  test('повертає помилку, якщо немає fileName', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await analysisController.analyzeSignal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fileName обовʼязковий' });
  });

  test('успішний аналіз', async () => {
    // Фейкові дані від Python
    const mockData = { mean: 0.5, variance: 0.1 };
    pythonService.runAnalysis.mockResolvedValue(mockData);

    const req = { body: { fileName: 'test.wav' } };
    const res = {
      json: jest.fn()
    };

    await analysisController.analyzeSignal(req, res);

    expect(pythonService.runAnalysis).toHaveBeenCalledWith('test.wav');
    expect(res.json).toHaveBeenCalledWith({
      message: 'Аналіз виконано успішно',
      data: mockData
    });
  });

  test('обробка помилки від pythonService', async () => {
    pythonService.runAnalysis.mockRejectedValue(new Error('Проблема Python'));

    const req = { body: { fileName: 'test.wav' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await analysisController.analyzeSignal(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Помилка при обробці файлу Python' });
  });
});
