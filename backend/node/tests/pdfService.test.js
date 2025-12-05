// 1. Мокаємо pdfkit з вбудованими mock-функціями
jest.mock('pdfkit', () => {
  const mockText = jest.fn().mockReturnThis();
  const mockImage = jest.fn().mockReturnThis();
  const mockFont = jest.fn().mockReturnThis(); // ДОДАНО

  const mockInstance = {
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: mockText,
    addPage: jest.fn().mockReturnThis(),
    image: mockImage,
    font: mockFont, // ДОДАНО
    moveDown: jest.fn().mockReturnThis(), // ДОДАНО
    end: jest.fn()
  };

  const mockConstructor = jest.fn(() => mockInstance);
  mockConstructor.__mockInstance = mockInstance;

  return mockConstructor;
});

// 2. Мокаємо fs.createWriteStream ДО імпорту сервісу
const fs = require('fs');
const mockStream = {
  on: jest.fn((event, handler) => {
    if (event === 'finish') handler();
    return mockStream;
  }),
  end: jest.fn()
};

jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockStream);

// 3. Імпортуємо pdfService після моків
const pdfService = require('../services/pdfService');
const PDFDocument = require('pdfkit');

describe('pdfService.createPDF - мок-тест', () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('викликаються text() для статистики та image() для графіків', async () => {
    const mockGraphs = [{
      name: 'Chart1',
      imageBase64: 'data:image/png;base64,aGVsbG8='
    }];

    const mockStats = {
      CircularMean: 0.5,
      Duration: 1.2
    };

    const fileName = 'mock_pdf';

    const resultPath = await pdfService.createPDF({
      graphs: mockGraphs,
      statistics: mockStats,
      fileName
    });

    // ✅ Перевірка поверненого шляху
    expect(resultPath).toContain('mock_pdf.pdf');

    // ✅ Дістаємо мок-екземпляр PDFDocument
    const instance = PDFDocument.__mockInstance;

    // ✅ Перевіряємо, що метод text викликано
    expect(instance.text).toHaveBeenCalled();
    
    // ✅ Перевіряємо, що font викликано (якщо шрифт існує)
    // expect(instance.font).toHaveBeenCalled(); // Опціонально

    // ✅ Перевіряємо, що image викликано
    expect(instance.image).toHaveBeenCalled();
  });
});