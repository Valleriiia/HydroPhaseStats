const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createPDF = async ({ graphs = [], statistics = {}, characteristics = {}, fileName = 'result' }) => {
  const outputDir = path.join(__dirname, '../../../data/results');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const pdfPath = path.join(outputDir, `${fileName}.pdf`);
  const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // --- Header ---
  doc.fontSize(20).text('HydroPhase Analysis Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`File: ${fileName}`, { align: 'center', color: 'grey' });
  doc.text(`Date: ${new Date().toLocaleString()}`, { align: 'center', color: 'grey' });
  doc.moveDown(2);

  // --- Characteristics Section ---
  doc.fontSize(16).fillColor('black').text('Signal Characteristics', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  
  for (const [key, value] of Object.entries(characteristics)) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(`${value}`);
  }
  doc.moveDown(2);

  // --- Statistics Section ---
  // Перевірка місця для блоку статистики (приблизно)
  if (doc.y + 150 > doc.page.height - 50) {
      doc.addPage();
  }

  doc.fontSize(16).font('Helvetica').text('Phase Statistics', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);

  for (const [key, value] of Object.entries(statistics)) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const displayValue = value === null ? 'N/A' : value;
      
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(`${displayValue}`);
  }
  doc.moveDown(2);

  // --- Graphs Section ---
  doc.addPage(); // Починаємо графіки з нової сторінки
  doc.fontSize(16).text('Visual Analysis', { align: 'center', underline: true });
  doc.moveDown();

  for (const graph of graphs) {
    if (!graph || !graph.imageBase64) continue;

    const base64Data = graph.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    let imgBuffer;
    try {
      imgBuffer = Buffer.from(base64Data, 'base64');
      
      // --- ЛОГІКА ПЕРЕНОСУ ---
      // Висота картинки (300) + висота заголовка (~20) + відступи (~30) = ~350
      const neededHeight = 350;
      const maxY = doc.page.height - doc.page.margins.bottom;

      // Якщо поточна позиція + необхідна висота виходить за межі, додаємо сторінку
      if (doc.y + neededHeight > maxY) {
          doc.addPage();
      } else {
          // Якщо ми не додали сторінку, просто робимо відступ від попереднього графіка
          doc.moveDown();
      }
      
      // Заголовок графіка
      doc.fontSize(14).font('Helvetica-Bold').text(graph.name, { align: 'center' });
      doc.moveDown(0.5);
      
      // Картинка
      doc.image(imgBuffer, { fit: [500, 300], align: 'center' });
      doc.moveDown();
      
    } catch (e) {
      // Якщо помилка, пишемо її червоним (теж перевіряємо місце)
      if (doc.y + 20 > doc.page.height - doc.page.margins.bottom) doc.addPage();
      doc.fontSize(10).fillColor('red').text(`Error loading graph: ${graph.name}`);
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', (err) => reject(err));
  });
};