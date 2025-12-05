const { spawn } = require('child_process');
const path = require('path');

exports.runAnalysis = (fileName, options = {}) => {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; 
    const scriptPath = path.join(__dirname, '../../python/main.py');
    const filePath = path.join(__dirname, '../../../data/uploads', fileName);
    
    // Перетворюємо options на JSON-рядок для передачі в Python
    const optionsString = JSON.stringify(options);

    // Передаємо filePath першим аргументом, optionsString другим
    const process = spawn(pythonPath, [scriptPath, filePath, optionsString]);

    let result = '';
    let error = '';

    process.stdout.on('data', (data) => {
      result += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.error("Python Error Output:", error); // Логування помилки
        return reject(error || 'Python exited with error');
      }
      try {
        resolve(JSON.parse(result));
      } catch (e) {
        reject('Некоректний JSON з Python: ' + result);
      }
    });
  });
};