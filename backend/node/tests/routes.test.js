const request = require('supertest');
const express = require('express');

// Мокаємо контролери
jest.mock('../controllers/uploadController');
jest.mock('../controllers/analysisController');
jest.mock('../controllers/exportController');
jest.mock('../middleware/fileUpload', () => ({
  single: jest.fn(() => (req, res, next) => next())
}));

const uploadController = require('../controllers/uploadController');
const analysisController = require('../controllers/analysisController');
const exportController = require('../controllers/exportController');

describe('Routes Integration Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
  });

  describe('Upload Routes', () => {
    beforeEach(() => {
      const uploadRoutes = require('../routes/upload');
      app.use('/api/upload', uploadRoutes);
    });

    test('POST /api/upload викликає uploadController.handleUpload', async () => {
      uploadController.handleUpload.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/upload')
        .expect(200);

      expect(uploadController.handleUpload).toHaveBeenCalled();
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('Analysis Routes', () => {
    beforeEach(() => {
      // Очищаємо require.cache для чистого імпорту
      delete require.cache[require.resolve('../routes/analysis')];
      const analysisRoutes = require('../routes/analysis');
      app.use('/api/analysis', analysisRoutes);
    });

    test('POST /api/analysis викликає analysisController.analyzeSignal', async () => {
      analysisController.analyzeSignal.mockImplementation((req, res) => {
        res.json({ message: 'Аналіз виконано' });
      });

      const response = await request(app)
        .post('/api/analysis')
        .send({ fileName: 'test.wav' })
        .expect(200);

      expect(analysisController.analyzeSignal).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Аналіз виконано' });
    });
  });

  describe('Export Routes', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('../routes/export')];
      const exportRoutes = require('../routes/export');
      app.use('/api/export', exportRoutes);
    });

    test('POST /api/export/pdf викликає exportController.exportToPDF', async () => {
      exportController.exportToPDF.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/export/pdf')
        .send({
          graphs: [{ name: 'test' }],
          statistics: { mean: 0.5 },
          fileName: 'test'
        })
        .expect(200);

      expect(exportController.exportToPDF).toHaveBeenCalled();
      expect(response.body).toEqual({ success: true });
    });

    test('POST /api/export/png викликає exportController.exportToPNG', async () => {
      exportController.exportToPNG.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/export/png')
        .send({
          graphs: [{ name: 'test' }],
          fileName: 'test'
        })
        .expect(200);

      expect(exportController.exportToPNG).toHaveBeenCalled();
      expect(response.body).toEqual({ success: true });
    });
  });
});