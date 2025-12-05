// Мокаємо сервіси ДО імпорту контролера
jest.mock('../services/pdfService', () => ({
  createPDF: jest.fn()
}));

jest.mock('../services/pngService', () => ({
  exportAsZip: jest.fn()
}));

const exportController = require('../controllers/exportController');
const pdfService = require('../services/pdfService');
const pngService = require('../services/pngService');

describe('exportController', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('exportToPDF', () => {
    test('повертає помилку, якщо немає даних graphs', async () => {
      const req = {
        body: {
          statistics: { mean: 0.5 },
          fileName: 'test'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await exportController.exportToPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Немає даних' });
    });

    test('повертає помилку, якщо немає даних statistics', async () => {
      const req = {
        body: {
          graphs: [{ name: 'test' }],
          fileName: 'test'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await exportController.exportToPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Немає даних' });
    });

    test('успішно створює PDF та повертає файл', async () => {
      const mockPdfPath = '/path/to/result.pdf';
      pdfService.createPDF.mockResolvedValue(mockPdfPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          statistics: { mean: 0.5, variance: 0.1 },
          fileName: 'test'
        }
      };
      const res = {
        download: jest.fn((path, callback) => {
          // Симулюємо успішне завантаження
          if (callback) callback();
        })
      };

      // Мокаємо fs.unlink
      const fs = require('fs');
      jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        if (callback) callback();
      });

      await exportController.exportToPDF(req, res);

      expect(pdfService.createPDF).toHaveBeenCalledWith({
        graphs: req.body.graphs,
        statistics: req.body.statistics,
        fileName: req.body.fileName
      });
      expect(res.download).toHaveBeenCalled();
      // Перевіряємо що download викликано з правильним шляхом (перший аргумент)
      expect(res.download.mock.calls[0][0]).toBe(mockPdfPath);
    });

    test('обробляє помилку від pdfService', async () => {
      const testError = new Error('PDF generation failed');
      pdfService.createPDF.mockRejectedValue(testError);

      const req = {
        body: {
          graphs: [{ name: 'graph1' }],
          statistics: { mean: 0.5 },
          fileName: 'test'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await exportController.exportToPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Помилка експорту PDF' });
    });

    test('обробляє помилку у res.download callback', async () => {
      const mockPdfPath = '/path/to/result.pdf';
      pdfService.createPDF.mockResolvedValue(mockPdfPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          statistics: { mean: 0.5 },
          fileName: 'test'
        }
      };
      
      const downloadError = new Error('Download failed');
      const res = {
        download: jest.fn((path, callback) => {
          // Симулюємо помилку при відправці
          callback(downloadError);
        })
      };

      // Мокаємо fs.unlink
      const fs = require('fs');
      const unlinkSpy = jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        callback();
      });

      await exportController.exportToPDF(req, res);

      // Перевіряємо що помилка була залогована
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending PDF:', downloadError);
      
      // Перевіряємо що файл все одно намагалися видалити
      expect(unlinkSpy).toHaveBeenCalledWith(mockPdfPath, expect.any(Function));
    });

    test('обробляє помилку при видаленні PDF файлу', async () => {
      const mockPdfPath = '/path/to/result.pdf';
      pdfService.createPDF.mockResolvedValue(mockPdfPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          statistics: { mean: 0.5 },
          fileName: 'test'
        }
      };

      const res = {
        download: jest.fn((path, callback) => {
          callback(); // Успішна відправка
        })
      };

      const fs = require('fs');
      const unlinkError = new Error('Cannot delete file');
      jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        callback(unlinkError);
      });

      await exportController.exportToPDF(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting PDF:', unlinkError);
    });
  });

  describe('exportToPNG', () => {

    test('повертає помилку, якщо немає графіків', async () => {
      const req = {
        body: {
          fileName: 'test'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await exportController.exportToPNG(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Немає графіків' });
    });

    test('успішно створює ZIP з PNG та повертає файл', async () => {
      const mockZipPath = '/path/to/result.zip';
      pngService.exportAsZip.mockResolvedValue(mockZipPath);

      const req = {
        body: {
          graphs: [
            { name: 'graph1', imageBase64: 'base64data1' },
            { name: 'graph2', imageBase64: 'base64data2' }
          ],
          fileName: 'test'
        }
      };
      const res = {
        download: jest.fn((path, callback) => {
          if (callback) callback();
        })
      };

      // Мокаємо fs
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        if (callback) callback();
      });

      await exportController.exportToPNG(req, res);

      expect(pngService.exportAsZip).toHaveBeenCalledWith({
        graphs: req.body.graphs,
        fileName: req.body.fileName
      });
      expect(res.download).toHaveBeenCalled();
      expect(res.download.mock.calls[0][0]).toBe(mockZipPath);
    });

    test('обробляє помилку від pngService', async () => {
      const testError = new Error('ZIP creation failed');
      pngService.exportAsZip.mockRejectedValue(testError);

      const req = {
        body: {
          graphs: [{ name: 'graph1' }],
          fileName: 'test'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await exportController.exportToPNG(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Помилка експорту PNG ZIP' });
      // ВИПРАВЛЕНО: console.error викликається з двома аргументами
      expect(consoleErrorSpy).toHaveBeenCalledWith('PNG export error:', testError);
    });

    test('обробляє помилку у res.download callback для ZIP', async () => {
      const mockZipPath = '/path/to/result.zip';
      pngService.exportAsZip.mockResolvedValue(mockZipPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          fileName: 'test'
        }
      };

      const downloadError = new Error('ZIP download failed');
      const res = {
        download: jest.fn((path, callback) => {
          callback(downloadError);
        })
      };

      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const unlinkSpy = jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        callback();
      });

      await exportController.exportToPNG(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending ZIP:', downloadError);
      expect(unlinkSpy).toHaveBeenCalled();
    });

    test('обробляє помилку при видаленні ZIP файлу', async () => {
      const mockZipPath = '/path/to/result.zip';
      pngService.exportAsZip.mockResolvedValue(mockZipPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          fileName: 'test'
        }
      };

      const res = {
        download: jest.fn((path, callback) => {
          callback(); // Успішна відправка
        })
      };

      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      const unlinkError = new Error('Cannot delete ZIP');
      jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
        callback(unlinkError);
      });

      await exportController.exportToPNG(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting ZIP:', unlinkError);
    });

    test('обробляє випадок коли ZIP файл не був створений', async () => {
      const mockZipPath = '/path/to/nonexistent.zip';
      pngService.exportAsZip.mockResolvedValue(mockZipPath);

      const req = {
        body: {
          graphs: [{ name: 'graph1', imageBase64: 'base64data' }],
          fileName: 'test'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const fs = require('fs');
      // Файл не існує
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      await exportController.exportToPNG(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Помилка експорту PNG ZIP' });
    });
  });
});