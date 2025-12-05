jest.mock('pdfkit', () => {
  const mockText = jest.fn().mockReturnThis();
  const mockImage = jest.fn().mockReturnThis();
  const mockAddPage = jest.fn().mockReturnThis();
  const mockMoveDown = jest.fn().mockReturnThis();
  const mockFont = jest.fn().mockReturnThis(); // ДОДАНО

  const mockInstance = {
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: mockText,
    addPage: mockAddPage,
    image: mockImage,
    moveDown: mockMoveDown,
    font: mockFont, // ДОДАНО
    end: jest.fn()
  };

  const mockConstructor = jest.fn(() => mockInstance);
  mockConstructor.__mockInstance = mockInstance;

  return mockConstructor;
});

const fs = require('fs');
const mockStream = {
  on: jest.fn((event, handler) => {
    if (event === 'finish') handler();
    return mockStream;
  }),
  end: jest.fn()
};

jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockStream);

const pdfService = require('../services/pdfService');
const PDFDocument = require('pdfkit');

describe('pdfService.createPDF - розширені тести', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test('обробляє порожні графіки', async () => {
    const mockGraphs = [];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'empty_graphs';

    const resultPath = await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    const instance = PDFDocument.__mockInstance;

    expect(resultPath).toContain('empty_graphs.pdf');
    expect(instance.image).not.toHaveBeenCalled();
  });

  test('пропускає графіки без imageBase64', async () => {
    const mockGraphs = [
      { name: 'Chart1' },
      { name: 'Chart2', imageBase64: null }
    ];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'no_images';

    await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    const instance = PDFDocument.__mockInstance;

    expect(instance.image).not.toHaveBeenCalled();
  });

  test('обробляє некоректний base64', async () => {
    const mockGraphs = [{
      name: 'BadChart',
      imageBase64: 'data:image/png;base64,!!!invalid!!!'
    }];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'invalid_base64';

    await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    const instance = PDFDocument.__mockInstance;

    expect(instance.addPage).toHaveBeenCalled();
    const textCalls = instance.text.mock.calls.map(call => call[0]);
    const hasGraphTitle = textCalls.some(text => 
      typeof text === 'string' && text.includes('BadChart')
    );
    expect(hasGraphTitle).toBe(true);
  });

  test('обробляє помилку при вставці зображення', async () => {
    const instance = PDFDocument.__mockInstance;
    instance.image.mockImplementationOnce(() => {
      throw new Error('Image format not supported');
    });

    const mockGraphs = [{
      name: 'ErrorChart',
      imageBase64: 'data:image/png;base64,aGVsbG8='
    }];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'image_error';

    await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    expect(instance.moveDown).toHaveBeenCalled();
    expect(instance.text).toHaveBeenCalledWith(
      expect.stringContaining('Помилка при вставці зображення')
    );
  });

  test('додає кілька графіків', async () => {
    const mockGraphs = [
      { name: 'Chart1', imageBase64: 'data:image/png;base64,aGVsbG8=' },
      { name: 'Chart2', imageBase64: 'data:image/png;base64,d29ybGQ=' },
      { name: 'Chart3', imageBase64: 'data:image/png;base64,dGVzdA==' }
    ];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'multiple_graphs';

    await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    const instance = PDFDocument.__mockInstance;

    expect(instance.image).toHaveBeenCalledTimes(3);
    expect(instance.addPage).toHaveBeenCalledTimes(3);
  });

  test('використовує дефолтні значення', async () => {
    const resultPath = await pdfService.createPDF({});

    expect(resultPath).toContain('result.pdf');
    
    const instance = PDFDocument.__mockInstance;
    expect(instance.text).toHaveBeenCalled();
  });

  test('обробляє помилку при записі файлу', async () => {
    const errorStream = {
      on: jest.fn((event, handler) => {
        if (event === 'error') handler(new Error('Write failed'));
        return errorStream;
      }),
      end: jest.fn()
    };

    jest.spyOn(fs, 'createWriteStream').mockReturnValueOnce(errorStream);

    const mockGraphs = [];
    const mockStats = { CircularMean: 0.5 };
    const fileName = 'write_error';

    await expect(
      pdfService.createPDF({
        graphs: mockGraphs,
        statistics: mockStats,
        fileName
      })
    ).rejects.toThrow('Write failed');
  });

  test('правильно форматує заголовок з назвою файлу', async () => {
    const fileName = 'test_analysis';
    const mockStats = {};

    await pdfService.createPDF({
      graphs: [],
      statistics: mockStats,
      fileName
    });

    const instance = PDFDocument.__mockInstance;

    expect(instance.text).toHaveBeenCalledWith(
      expect.stringContaining(fileName),
      expect.any(Object)
    );
  });
});