let mockArchiveInstance;
let mockOutputCallbacks = {};
let mockArchiveCallbacks = {};

jest.mock('archiver', () => {
  return jest.fn(() => {
    mockArchiveInstance = {
      pipe: jest.fn(),
      append: jest.fn(),
      finalize: jest.fn(),
      on: jest.fn((event, callback) => {
        mockArchiveCallbacks[event] = callback;
      }),
      pointer: jest.fn(() => 1024)
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
  let consoleLogSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOutputCallbacks = {};
    mockArchiveCallbacks = {};
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Мокаємо fs.createWriteStream
    jest.spyOn(fs, 'createWriteStream').mockImplementation(() => ({
      on: jest.fn((event, callback) => {
        mockOutputCallbacks[event] = callback;
        return this;
      })
    }));
    
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    jest.restoreAllMocks();
  });

  const triggerSuccess = () => {
    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });
  };

  const triggerError = (error) => {
    setImmediate(() => {
      if (mockOutputCallbacks['error']) {
        mockOutputCallbacks['error'](error);
      }
    });
  };

  const triggerArchiveError = (error) => {
    setImmediate(() => {
      if (mockArchiveCallbacks['error']) {
        mockArchiveCallbacks['error'](error);
      }
    });
  };

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

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerSuccess();
    const zipPath = await promise;

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

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerSuccess();
    await promise;

    // Тільки перший графік має бути доданий
    expect(mockArchiveInstance.append).toHaveBeenCalledTimes(1);
  });

  test('обробляє порожній масив графіків', async () => {
    const testGraphs = [];
    const fileName = 'empty_graphs';

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerSuccess();
    const zipPath = await promise;

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

    const promise = pngService.exportAsZip({
      graphs: testGraphs
      // fileName не передано
    });

    triggerSuccess();
    const zipPath = await promise;

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

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerSuccess();
    await promise;

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

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerSuccess();
    await promise;

    expect(mockArchiveInstance.append).toHaveBeenCalledWith(
      expect.any(Buffer),
      { name: 'graph_1.png' }
    );
  });

  test('обробляє помилку архівування', async () => {
    const testError = new Error('Archiving failed');
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const fileName = 'error_test';

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName
    });

    triggerArchiveError(testError);

    await expect(promise).rejects.toThrow('Archiving failed');
  });

  test('обробляє помилку запису файлу', async () => {
    const testError = new Error('Write error');
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'write_error_test'
    });

    triggerError(testError);

    await expect(promise).rejects.toThrow('Write error');
  });

  test('успішно завершується при події close на output stream', async () => {
    const testGraphs = [
      {
        name: 'graph1',
        imageBase64: 'data:image/png;base64,' + minimalPngBase64
      }
    ];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'finish_event_test'
    });

    triggerSuccess();
    const zipPath = await promise;

    expect(zipPath).toContain('finish_event_test.zip');
    expect(mockArchiveInstance.finalize).toHaveBeenCalled();
    expect(mockArchiveInstance.pipe).toHaveBeenCalled();
  });

  test('обробляє подію "end" на output stream', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'end_event_test'
    });

    // Спочатку тригеримо 'end', потім 'close'
    setImmediate(() => {
      if (mockOutputCallbacks['end']) {
        mockOutputCallbacks['end']();
      }
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    // Перевіряємо що 'end' був оброблений
    expect(consoleLogSpy).toHaveBeenCalledWith('Data has been drained');
  });

  test('обробляє подію "warning" з кодом ENOENT', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'warning_test'
    });

    setImmediate(() => {
      // Тригеримо warning з кодом ENOENT
      if (mockArchiveCallbacks['warning']) {
        const warning = new Error('File not found');
        warning.code = 'ENOENT';
        mockArchiveCallbacks['warning'](warning);
      }
      // Потім успішно завершуємо
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    // Має бути попередження в консолі
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Archive warning:',
      expect.objectContaining({ code: 'ENOENT' })
    );
  });

  test('обробляє подію "warning" з іншим кодом як помилку', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'warning_error_test'
    });

    const warningError = new Error('Critical warning');
    warningError.code = 'CRITICAL';

    setImmediate(() => {
      if (mockArchiveCallbacks['warning']) {
        mockArchiveCallbacks['warning'](warningError);
      }
    });

    await expect(promise).rejects.toThrow('Critical warning');
  });

  test('не викликає resolve двічі при множинних події close', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'double_close_test'
    });

    setImmediate(() => {
      // Викликаємо close двічі
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
        mockOutputCallbacks['close'](); // Другий раз
      }
    });

    const result = await promise;
    
    // Promise має резолвитися тільки раз
    expect(result).toContain('double_close_test.zip');
  });

  test('не викликає reject двічі при множинних помилках', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'double_error_test'
    });

    const error1 = new Error('First error');
    const error2 = new Error('Second error');

    setImmediate(() => {
      if (mockOutputCallbacks['error']) {
        mockOutputCallbacks['error'](error1);
        mockOutputCallbacks['error'](error2); // Друга помилка ігнорується
      }
    });

    await expect(promise).rejects.toThrow('First error');
  });

  test('пропускає графік з порожнім буфером', async () => {
    const testGraphs = [{
      name: 'empty_graph',
      imageBase64: 'data:image/png;base64,' // Порожній base64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'empty_buffer_test'
    });

    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    // Перевіряємо що графік був пропущений
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Empty buffer')
    );
    
    // append НЕ має бути викликаний для порожнього буфера
    expect(mockArchiveInstance.append).not.toHaveBeenCalled();
  });

  test('виводить лог з кількістю доданих зображень', async () => {
    const testGraphs = [
      { name: 'graph1', imageBase64: 'data:image/png;base64,' + minimalPngBase64 },
      { name: 'graph2', imageBase64: 'data:image/png;base64,' + minimalPngBase64 },
      { name: 'graph3', imageBase64: 'data:image/png;base64,' + minimalPngBase64 }
    ];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'multiple_images_log'
    });

    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    // Перевіряємо що було виведено правильну кількість
    expect(consoleLogSpy).toHaveBeenCalledWith('Adding 3 images to ZIP');
  });

  test('виводить розмір архіву після створення', async () => {
    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'archive_size_test'
    });

    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    // Перевіряємо що pointer() був викликаний і виведено розмір
    expect(mockArchiveInstance.pointer).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('ZIP created: 1024 bytes')
    );
  });

  test('створює директорію якщо вона не існує', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation();

    const testGraphs = [{
      name: 'graph1',
      imageBase64: 'data:image/png;base64,' + minimalPngBase64
    }];

    const promise = pngService.exportAsZip({
      graphs: testGraphs,
      fileName: 'create_dir_test'
    });

    setImmediate(() => {
      if (mockOutputCallbacks['close']) {
        mockOutputCallbacks['close']();
      }
    });

    await promise;

    expect(mkdirSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('results'),
      { recursive: true }
    );
  });
});