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

    let resolved = false;
    const cleanupAndResolve = () => {
      if (!resolved) {
        resolved = true;
        resolve(zipPath);
      }
    };
    const cleanupAndReject = (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    };

    output.on('close', () => cleanupAndResolve());
    output.on('finish', () => cleanupAndResolve());
    output.on('error', (err) => cleanupAndReject(err));
    archive.on('error', (err) => cleanupAndReject(err));
    archive.on('close', () => cleanupAndResolve());

    archive.pipe(output);

    // Додаємо зображення
    graphs.forEach((graph, index) => {
      if (!graph || !graph.imageBase64) return;
      const base64Data = graph.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      // Ім'я файлу в архіві
      const entryName = `${graph.name || 'graph'}_${index + 1}.png`;
      archive.append(imgBuffer, { name: entryName });
    });

    archive.finalize();
  });
};
