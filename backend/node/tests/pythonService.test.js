const pythonService = require('../services/pythonService');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

jest.mock('child_process');

describe('pythonService.runAnalysis', () => {
  let mockProcess;

  beforeEach(() => {
    mockProcess = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    spawn.mockReturnValue(mockProcess);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('успішний аналіз з валідним JSON', async () => {
    const mockResult = { mean: 0.5, variance: 0.1, duration: 2.5 };
    const fileName = 'test.wav';

    const resultPromise = pythonService.runAnalysis(fileName);

    // Імітуємо відповідь від Python
    mockProcess.stdout.emit('data', JSON.stringify(mockResult));
    mockProcess.emit('close', 0);

    const result = await resultPromise;

    expect(result).toEqual(mockResult);
    expect(spawn).toHaveBeenCalledWith(
      'python',
      expect.arrayContaining([
        expect.stringContaining('main.py'),
        expect.stringContaining(fileName)
      ])
    );
  });

  test('обробка помилки з stderr', async () => {
    const fileName = 'test.wav';
    const errorMessage = 'Python error occurred';

    const resultPromise = pythonService.runAnalysis(fileName);

    mockProcess.stderr.emit('data', errorMessage);
    mockProcess.emit('close', 1);

    await expect(resultPromise).rejects.toBe(errorMessage);
  });

  test('обробка ненульового коду виходу без stderr', async () => {
    const fileName = 'test.wav';

    const resultPromise = pythonService.runAnalysis(fileName);

    mockProcess.emit('close', 1);

    await expect(resultPromise).rejects.toBe('Python exited with error');
  });

  test('обробка некоректного JSON', async () => {
    const fileName = 'test.wav';

    const resultPromise = pythonService.runAnalysis(fileName);

    mockProcess.stdout.emit('data', 'invalid json{{{');
    mockProcess.emit('close', 0);

    await expect(resultPromise).rejects.toBe('Некоректний JSON з Python');
  });

  test('обробка множинних частин даних від stdout', async () => {
    const mockResult = { mean: 0.5, variance: 0.1 };
    const fileName = 'test.wav';
    const jsonString = JSON.stringify(mockResult);
    const part1 = jsonString.slice(0, 10);
    const part2 = jsonString.slice(10);

    const resultPromise = pythonService.runAnalysis(fileName);

    mockProcess.stdout.emit('data', part1);
    mockProcess.stdout.emit('data', part2);
    mockProcess.emit('close', 0);

    const result = await resultPromise;

    expect(result).toEqual(mockResult);
  });

  test('обробка порожнього виводу', async () => {
    const fileName = 'test.wav';

    const resultPromise = pythonService.runAnalysis(fileName);

    mockProcess.emit('close', 0);

    await expect(resultPromise).rejects.toBe('Некоректний JSON з Python');
  });
});