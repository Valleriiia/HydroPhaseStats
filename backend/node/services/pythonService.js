const { spawn } = require('child_process');
const path = require('path');

exports.runAnalysis = (fileName) => {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // або 'python3', залежно від середовища
    const scriptPath = path.join(__dirname, '../../python/main.py');
    const filePath = path.join(__dirname, '../../../data/uploads', fileName);

    const process = spawn(pythonPath, [scriptPath, filePath]);

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
        return reject(error || 'Python exited with error');
      }
      try {
        resolve(JSON.parse(result)); // очікуємо JSON від Python
      } catch (e) {
        reject('Некоректний JSON з Python');
      }
    });
  });
};
