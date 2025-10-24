const multer = require('multer');
const fileUpload = require('../middleware/fileUpload');

describe('fileUpload middleware', () => {
  test('фільтрує неправильний тип файлу', (done) => {
    const req = {};
    const file = { mimetype: 'image/png' };
    
    fileUpload.fileFilter(req, file, (err, accept) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Непідтримуваний формат файлу');
      expect(accept).toBe(false);
      done();
    });
  });

  test('приймає правильний аудіо формат', (done) => {
    const req = {};
    const file = { mimetype: 'audio/wav' };

    fileUpload.fileFilter(req, file, (err, accept) => {
      expect(err).toBeNull();
      expect(accept).toBe(true);
      done();
    });
  });
});
