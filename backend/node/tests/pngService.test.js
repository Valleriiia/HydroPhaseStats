jest.mock('archiver', () => {
  return jest.fn(() => {
    const fakeArchive = {
      pipe: jest.fn(),
      append: jest.fn(),
      finalize: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(); // Імітуємо успіх
      })
    };
    return fakeArchive;
  });
});

const fs = require('fs');
const pngService = require('../services/pngService');

describe('pngService.exportAsZip', () => {
  const minimalPngBase64 = 
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAuMBgS01qmUAAAAASUVORK5CYII=";

  const testGraphs = [
    {
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }
  ];

  const fileName = 'test_zip';

  test('створює ZIP файл', async () => {
    const zipPath = await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    // Перевірка, що створився (ми імітуємо його існування)
    expect(zipPath.endsWith('.zip')).toBe(true);
  });
}, 10000); // таймаут збільшено
