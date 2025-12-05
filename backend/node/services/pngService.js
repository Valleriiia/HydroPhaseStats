const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.exportAsZip = ({ graphs = [], fileName = 'graphs' }) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../../../data/results');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const zipName = `${fileName}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    let isResolved = false;

    // ВИПРАВЛЕННЯ: Чекаємо 'close' на output stream (коли файл повністю записаний)
    output.on('close', () => {
      if (!isResolved) {
        isResolved = true;
        console.log(`ZIP created: ${archive.pointer()} bytes`);
        resolve(zipPath);
      }
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    output.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        reject(err);
      }
    });

    archive.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        reject(err);
      }
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        if (!isResolved) {
          isResolved = true;
          reject(err);
        }
      }
    });

    // ВАЖЛИВО: pipe перед додаванням файлів
    archive.pipe(output);

    // Додаємо зображення
    let addedCount = 0;
    graphs.forEach((graph, index) => {
      if (!graph || !graph.imageBase64) return;
      
      try {
        const base64Data = graph.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        // Перевіряємо що буфер не порожній
        if (imgBuffer.length === 0) {
          console.warn(`Empty buffer for graph ${index}`);
          return;
        }
        
        // Ім'я файлу в архіві (без кирилиці)
        const entryName = `${graph.name || 'graph'}_${index + 1}.png`;
        archive.append(imgBuffer, { name: entryName });
        addedCount++;
      } catch (e) {
        console.error(`Error adding graph ${index} to archive:`, e);
      }
    });

    console.log(`Adding ${addedCount} images to ZIP`);

    // Завершуємо архів (це запускає процес запису)
    archive.finalize();
  });
};