const path = require('path');
const fs = require('fs');

// Імпортуємо multer перед моками
const multer = require('multer');

describe('fileUpload middleware - розширені тести', () => {
  let fileUpload;

  beforeEach(() => {
    // Очищаємо require cache
    jest.clearAllMocks();
    delete require.cache[require.resolve('../middleware/fileUpload')];
    
    // Імпортуємо middleware знову
    fileUpload = require('../middleware/fileUpload');
  });

  describe('Storage Configuration', () => {
    test('storage має правильну конфігурацію', () => {
      expect(fileUpload.storage).toBeDefined();
    });

    test('destination функція повертає правильний шлях', (done) => {
      const req = {};
      const file = { originalname: 'test.wav' };
      
      // Отримуємо storage конфігурацію через multer
      const storage = fileUpload.storage;
      
      storage.getDestination(req, file, (err, destination) => {
        expect(err).toBeNull();
        expect(destination).toContain('data');
        expect(destination).toContain('uploads');
        done();
      });
    });

    test('filename функція генерує унікальну назву', (done) => {
      const req = {};
      const file = { 
        fieldname: 'audio',
        originalname: 'test.wav' 
      };
      
      const storage = fileUpload.storage;
      
      storage.getFilename(req, file, (err, filename) => {
        expect(err).toBeNull();
        expect(filename).toContain('audio-');
        expect(filename).toContain('.wav');
        expect(filename).toMatch(/audio-\d+-\d+\.wav/);
        done();
      });
    });

    test('filename функція генерує різні назви для різних файлів', (done) => {
      const req = {};
      const file1 = { 
        fieldname: 'audio',
        originalname: 'test1.wav' 
      };
      const file2 = { 
        fieldname: 'audio',
        originalname: 'test2.mp3' 
      };
      
      const storage = fileUpload.storage;
      
      storage.getFilename(req, file1, (err1, filename1) => {
        expect(err1).toBeNull();
        
        // Невелика затримка для різного timestamp
        setTimeout(() => {
          storage.getFilename(req, file2, (err2, filename2) => {
            expect(err2).toBeNull();
            expect(filename1).not.toBe(filename2);
            expect(filename1).toContain('.wav');
            expect(filename2).toContain('.mp3');
            done();
          });
        }, 10);
      });
    });
  });

  describe('File Filter - всі підтримувані формати', () => {
    test('приймає audio/wav', (done) => {
      const req = {};
      const file = { mimetype: 'audio/wav' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
        done();
      });
    });

    test('приймає audio/mpeg', (done) => {
      const req = {};
      const file = { mimetype: 'audio/mpeg' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
        done();
      });
    });

    test('приймає audio/mp3', (done) => {
      const req = {};
      const file = { mimetype: 'audio/mp3' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
        done();
      });
    });

    test('відхиляє video файли', (done) => {
      const req = {};
      const file = { mimetype: 'video/mp4' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Непідтримуваний формат файлу');
        expect(accept).toBe(false);
        done();
      });
    });

    test('відхиляє зображення', (done) => {
      const req = {};
      const file = { mimetype: 'image/jpeg' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Непідтримуваний формат файлу');
        expect(accept).toBe(false);
        done();
      });
    });

    test('відхиляє текстові файли', (done) => {
      const req = {};
      const file = { mimetype: 'text/plain' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Непідтримуваний формат файлу');
        expect(accept).toBe(false);
        done();
      });
    });

    test('відхиляє application файли', (done) => {
      const req = {};
      const file = { mimetype: 'application/pdf' };

      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Непідтримуваний формат файлу');
        expect(accept).toBe(false);
        done();
      });
    });
  });

  describe('Multer Instance', () => {
    test('fileUpload є multer об\'єктом', () => {
      expect(fileUpload).toBeDefined();
      expect(typeof fileUpload).toBe('object');
    });

    test('має метод single', () => {
      expect(fileUpload.single).toBeDefined();
      expect(typeof fileUpload.single).toBe('function');
    });

    test('single повертає middleware функцію', () => {
      const middleware = fileUpload.single('audio');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Integration with Storage and Filter', () => {
    test('використовує обидва: storage і fileFilter', () => {
      // Перевіряємо що multer інстанс має обидві конфігурації
      expect(fileUpload.storage).toBeDefined();
      
      // Перевіряємо fileFilter через тестовий виклик
      const req = {};
      const file = { mimetype: 'audio/wav' };
      
      fileUpload.fileFilter(req, file, (err, accept) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
      });
    });
  });
});