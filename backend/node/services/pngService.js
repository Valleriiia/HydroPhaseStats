const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.exportAsZip = ({ graphs, fileName }) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../../data/results');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const zipName = `${fileName || 'graphs'}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);

    archive.pipe(output);

    graphs.forEach((graph, index) => {
      const base64Data = graph.imageBase64.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      archive.append(imgBuffer, { name: `${graph.name || 'graph'}_${index + 1}.png` });
    });

    archive.finalize();
  });
};
