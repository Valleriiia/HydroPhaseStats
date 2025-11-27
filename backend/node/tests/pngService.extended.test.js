let mockArchiveInstance;
let mockArchiveError = null;

jest.mock('archiver', () => {
  return jest.fn(() => {
    mockArchiveInstance = {
      pipe: jest.fn(),
      append: jest.fn(),
      finalize: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'close' && !mockArchiveError) {
          callback();
        }
        if (event === 'error' && mockArchiveError) {
          callback(mockArchiveError);
        }
      })
    };
    return mockArchiveInstance;
  });
});

const fs = require('fs');
const pngService = require('../services/pngService');

describe('pngService.exportAsZip - розширені тести', () => {
  const minimalPngBase64 = 
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAuMBgS01qmUAAAAASUVORK5CYII=";
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockArchiveError = null;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

  test('створює ZIP з кількома графіками', async () => {
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      },
      {
        name: 'graph2',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      },
      {
        name: 'graph3',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const fileName = 'multiple_graphs';

    const zipPath = await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    expect(zipPath.endsWith('.zip')).toBe(true);
    expect(mockArchiveInstance.append).toHaveBeenCalledTimes(3);
    expect(mockArchiveInstance.finalize).toHaveBeenCalled();
  });

  test('пропускає графіки без imageBase64', async () => {
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      },
      {
        name: 'graph2'
        // немає imageBase64
      },
      {
        name: 'graph3',
        imageBase64: null
      }
    ];

    const fileName = 'partial_graphs';

    await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    // Тільки перший графік має бути доданий
    expect(mockArchiveInstance.append).toHaveBeenCalledTimes(1);
  });

  test('обробляє порожній масив графіків', async () => {
    const testGraphs = [];
    const fileName = 'empty_graphs';

    const zipPath = await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    expect(zipPath.endsWith('.zip')).toBe(true);
    expect(mockArchiveInstance.append).not.toHaveBeenCalled();
    expect(mockArchiveInstance.finalize).toHaveBeenCalled();
  });

  test('використовує дефолтну назву файлу', async () => {
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const zipPath = await pngService.exportAsZip({
      graphs: testGraphs
      // fileName не передано
    });

    expect(zipPath).toContain('graphs.zip');
  });

  test('правильно іменує файли в архіві', async () => {
    const testGraphs = [
      {
        name: 'spectrum',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      },
      {
        name: 'waveform',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const fileName = 'test';

    await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    expect(mockArchiveInstance.append).toHaveBeenCalledWith(
      expect.any(Buffer),
      { name: 'spectrum_1.png' }
    );
    expect(mockArchiveInstance.append).toHaveBeenCalledWith(
      expect.any(Buffer),
      { name: 'waveform_2.png' }
    );
  });

  test('обробляє графіки без назви', async () => {
    const testGraphs = [
      {
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
        // немає name
      }
    ];

    const fileName = 'unnamed';

    await pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    expect(mockArchiveInstance.append).toHaveBeenCalledWith(
      expect.any(Buffer),
      { name: 'graph_1.png' }
    );
  });

  test('обробляє помилку архівування', async () => {
    mockArchiveError = new Error('Archiving failed');

    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const fileName = 'error_test';

    await expect(
      pngService.exportAsZip({
        graphs: testGraphs,
        fileName
      })
    ).rejects.toThrow('Archiving failed');
  });

  test('обробляє помилку запису файлу', async () => {
    const mockOutput = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Write error'));
        }
      })
    };

    jest.spyOn(fs, 'createWriteStream').mockReturnValueOnce(mockOutput);

    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    await expect(
      pngService.exportAsZip({
        graphs: testGraphs,
        fileName: 'write_error_test'
      })
    ).rejects.toThrow('Write error');
  });

  test('успішно завершується при події finish на output stream', async () => {
    // Тестуємо що promise резолвиться при події 'finish'
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const zipPath = await pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'finish_event_test'
    });

    expect(zipPath).toContain('finish_event_test.zip');
    expect(mockArchiveInstance.finalize).toHaveBeenCalled();
    expect(mockArchiveInstance.pipe).toHaveBeenCalled();
  });
});