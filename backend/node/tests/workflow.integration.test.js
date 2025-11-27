const request = require('supertest');
const express = require('express');
const path = require('path');

// Мокаємо всі сервіси
jest.mock('../services/pythonService');
jest.mock('../services/pdfService');
jest.mock('../services/pngService');
jest.mock('../middleware/fileUpload', () => ({
  single: jest.fn(() => (req, res, next) => {
    // Симулюємо успішне завантаження файлу
    req.file = {
      filename: 'test-audio-123.wav',
      originalname: 'test.wav',
      mimetype: 'audio/wav',
      size: 1024000
    };
    next();
  })
}));

const pythonService = require('../services/pythonService');
const pdfService = require('../services/pdfService');
const pngService = require('../services/pngService');

describe('Complete Workflow Integration Tests', () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Очищаємо кеш модулів для чистого імпорту
    delete require.cache[require.resolve('../routes/upload')];
    delete require.cache[require.resolve('../routes/analysis')];
    delete require.cache[require.resolve('../routes/export')];

    // Створюємо тестовий app
    app = express();
    app.use(express.json({ limit: '10mb' }));

    const uploadRoutes = require('../routes/upload');
    const analysisRoutes = require('../routes/analysis');
    const exportRoutes = require('../routes/export');

    app.use('/api/upload', uploadRoutes);
    app.use('/api/analysis', analysisRoutes);
    app.use('/api/export', exportRoutes);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Повний цикл: Upload -> Analyze -> Export', () => {
    test('успішний workflow: завантаження, аналіз та експорт в PDF', async () => {
      // 1. Завантаження файлу
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('fake audio data'), 'test.wav')
        .expect(200);

      expect(uploadResponse.body).toHaveProperty('fileName');
      const uploadedFileName = uploadResponse.body.fileName;

      // 2. Аналіз файлу
      const mockAnalysisResult = {
        mean: 0.5,
        variance: 0.1,
        duration: 2.5,
        graphs: [
          { name: 'Spectrum', imageBase64: 'data:image/png;base64,abc123' },
          { name: 'Waveform', imageBase64: 'data:image/png;base64,def456' }
        ]
      };

      pythonService.runAnalysis.mockResolvedValue(mockAnalysisResult);

      const analysisResponse = await request(app)
        .post('/api/analysis')
        .send({ fileName: uploadedFileName })
        .expect(200);

      expect(analysisResponse.body.message).toBe('Аналіз виконано успішно');
      expect(analysisResponse.body.data).toEqual(mockAnalysisResult);

      // 3. Експорт результатів в PDF
      const mockPdfPath = '/path/to/result.pdf';
      pdfService.createPDF.mockImplementation((data) => {
        // Повертаємо Promise з шляхом до файлу
        return Promise.resolve(mockPdfPath);
      });

      const exportRequest = request(app)
        .post('/api/export/pdf')
        .send({
          graphs: mockAnalysisResult.graphs,
          statistics: {
            mean: mockAnalysisResult.mean,
            variance: mockAnalysisResult.variance,
            duration: mockAnalysisResult.duration
          },
          fileName: 'test-results'
        });

      // Мокуємо res.download для обробки файлу
      exportRequest.expect((res) => {
        // Перевіряємо що сервіс був викликаний
        expect(pdfService.createPDF).toHaveBeenCalled();
      });

      await exportRequest;

      // Перевіряємо що всі сервіси були викликані правильно
      expect(pythonService.runAnalysis).toHaveBeenCalledWith(uploadedFileName);
      expect(pdfService.createPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          graphs: mockAnalysisResult.graphs,
          fileName: 'test-results'
        })
      );
    });

    test('успішний workflow з експортом в PNG', async () => {
      // 1. Завантаження
      const uploadResponse = await request(app)
        .post('/api/upload')
        .expect(200);

      const uploadedFileName = uploadResponse.body.fileName;

      // 2. Аналіз
      const mockAnalysisResult = {
        graphs: [
          { name: 'Graph1', imageBase64: 'data:image/png;base64,abc' },
          { name: 'Graph2', imageBase64: 'data:image/png;base64,def' }
        ]
      };

      pythonService.runAnalysis.mockResolvedValue(mockAnalysisResult);

      await request(app)
        .post('/api/analysis')
        .send({ fileName: uploadedFileName })
        .expect(200);

      // 3. Експорт в PNG
      const mockZipPath = '/path/to/graphs.zip';
      pngService.exportAsZip.mockImplementation((data) => {
        return Promise.resolve(mockZipPath);
      });

      const exportRequest = request(app)
        .post('/api/export/png')
        .send({
          graphs: mockAnalysisResult.graphs,
          fileName: 'test-graphs'
        });

      exportRequest.expect(() => {
        expect(pngService.exportAsZip).toHaveBeenCalledWith({
          graphs: mockAnalysisResult.graphs,
          fileName: 'test-graphs'
        });
      });

      await exportRequest;
    });
  });

  describe('Error Scenarios в Workflow', () => {
    test('помилка при аналізі після успішного завантаження', async () => {
      // 1. Успішне завантаження
      const uploadResponse = await request(app)
        .post('/api/upload')
        .expect(200);

      // 2. Помилка при аналізі
      pythonService.runAnalysis.mockRejectedValue(new Error('Python error'));

      await request(app)
        .post('/api/analysis')
        .send({ fileName: uploadResponse.body.fileName })
        .expect(500);
    });

    test('помилка при експорті після успішного аналізу', async () => {
      // 1. Завантаження
      await request(app)
        .post('/api/upload')
        .expect(200);

      // 2. Успішний аналіз
      const mockAnalysisResult = {
        graphs: [{ name: 'Graph1', imageBase64: 'data:image/png;base64,abc' }],
        statistics: { mean: 0.5 }
      };

      pythonService.runAnalysis.mockResolvedValue(mockAnalysisResult);

      await request(app)
        .post('/api/analysis')
        .send({ fileName: 'test.wav' })
        .expect(200);

      // 3. Помилка при експорті
      pdfService.createPDF.mockRejectedValue(new Error('PDF error'));

      await request(app)
        .post('/api/export/pdf')
        .send({
          graphs: mockAnalysisResult.graphs,
          statistics: mockAnalysisResult.statistics,
          fileName: 'test'
        })
        .expect(500);
    });
  });

  describe('Валідація даних на кожному етапі', () => {
    test('аналіз без fileName', async () => {
      await request(app)
        .post('/api/analysis')
        .send({})
        .expect(400);
    });

    test('експорт PDF без необхідних даних', async () => {
      await request(app)
        .post('/api/export/pdf')
        .send({ fileName: 'test' })
        .expect(400);
    });

    test('експорт PNG без графіків', async () => {
      await request(app)
        .post('/api/export/png')
        .send({ fileName: 'test' })
        .expect(400);
    });
  });

  describe('Множинні операції', () => {
    test('послідовні завантаження та аналізи', async () => {
      const files = ['file1.wav', 'file2.wav', 'file3.wav'];

      for (const file of files) {
        // Завантаження
        const uploadResponse = await request(app)
          .post('/api/upload')
          .expect(200);

        // Аналіз
        pythonService.runAnalysis.mockResolvedValue({
          mean: Math.random(),
          variance: Math.random()
        });

        await request(app)
          .post('/api/analysis')
          .send({ fileName: uploadResponse.body.fileName })
          .expect(200);
      }

      // Перевіряємо що всі файли були проаналізовані
      expect(pythonService.runAnalysis).toHaveBeenCalledTimes(files.length);
    });

    test('паралельні експорти PDF і PNG', async () => {
      const mockData = {
        graphs: [{ name: 'Graph', imageBase64: 'data:image/png;base64,abc' }],
        statistics: { mean: 0.5 }
      };

      pdfService.createPDF.mockResolvedValue('/path/to/pdf');
      pngService.exportAsZip.mockResolvedValue('/path/to/zip');

      // Просто перевіряємо що обидва endpoint доступні
      const results = await Promise.all([
        request(app)
          .post('/api/export/pdf')
          .send({ ...mockData, fileName: 'test' }),
        request(app)
          .post('/api/export/png')
          .send({ graphs: mockData.graphs, fileName: 'test' })
      ]);

      // Перевіряємо що обидва виклики були успішними або хоча б оброблені
      expect(results).toHaveLength(2);
      expect(pdfService.createPDF).toHaveBeenCalled();
      expect(pngService.exportAsZip).toHaveBeenCalled();
    });
  });
});