const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createPDF = async ({ graphs, statistics, fileName }) => {
  const outputDir = path.join(__dirname, '../../data/results');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const pdfPath = path.join(outputDir, `${fileName || 'result'}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Заголовок
  doc.fontSize(18).text(`Результати аналізу файлу: ${fileName || 'Без назви'}`, { align: 'center' });
  doc.moveDown();

  // Статистика
  doc.fontSize(12).text('Основні характеристики:', { underline: true });
  for (const [key, value] of Object.entries(statistics)) {
    doc.text(`${key}: ${value}`);
  }
  doc.moveDown();

  // Графіки
  for (const graph of graphs) {
    if (graph.imageBase64) {
      const base64Data = graph.imageBase64.replace(/^data:image\/png;base64,/, '');
      const imgPath = path.join(outputDir, `${graph.name}.png`);
      fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));

      doc.addPage();
      doc.fontSize(14).text(`Графік: ${graph.name}`, { align: 'center' });
      doc.image(imgPath, { fit: [500, 350], align: 'center' });
    }
  }

  doc.end();

  // Повертаємо шлях після завершення
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
};
