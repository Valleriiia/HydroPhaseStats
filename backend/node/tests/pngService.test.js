let mockArchiveInstance;
let mockOutputCallbacks = {};

jest.mock('archiver', () => {
  return jest.fn(() => {
    mockArchiveInstance = {
      pipe: jest.fn(),
      append: jest.fn(),
      finalize: jest.fn(),
      on: jest.fn(),
      pointer: jest.fn(() => 1024)
    };
    return mockArchiveInstance;
  });
});

const fs = require('fs');
const pngService = require('../services/pngService');

describe('pngService.exportAsZip', () => {
  const minimalPngBase64 = 
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAuMBgS01qmUAAAAASUVORK5CYII=";

  beforeEach(() => {
    jest.clearAllMocks();
    mockOutputCallbacks = {};
    
    // Мокаємо fs.createWriteStream
    jest.spyOn(fs, 'createWriteStream').mockImplementation(() => ({
      on: jest.fn((event, callback) => {
        mockOutputCallbacks[event] = callback;
        return this;
      })
    }));
    
    // Мокаємо fs.existsSync
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('створює ZIP файл', async () => {
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const fileName = 'test_zip';

    // Запускаємо функцію
    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    // Симулюємо успішне завершення запису
    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    const zipPath = await promise;

    // Перевірка, що створився
    expect(zipPath.endsWith('.zip')).toBe(true);
    expect(mockArchiveInstance.append).toHaveBeenCalled();
    expect(mockArchiveInstance.finalize).toHaveBeenCalled();
  });
}, 10000);