const uploadController = require('../controllers/uploadController');

describe('uploadController.handleUpload', () => {
  test('повертає помилку, якщо файл не передано', () => {
    // Створюємо mock запит/відповідь
    const req = { file: null };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    uploadController.handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Файл не завантажено' });
  });

  test('успішне завантаження файлу', () => {
    const req = {
      file: {
        filename: 'audio-12345.wav'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    uploadController.handleUpload(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Файл успішно завантажено',
      fileName: 'audio-12345.wav',
      filePath: '/uploads/audio-12345.wav'
    });
  });
});
