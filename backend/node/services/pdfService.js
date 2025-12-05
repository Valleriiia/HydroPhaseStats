const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createPDF = async ({ graphs = [], statistics = {}, fileName = 'result' }) => {
  const outputDir = path.join(__dirname, '../../../data/results');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fontPath = path.join(__dirname, '../../../fonts/Roboto-Regular.ttf');

  const pdfPath = path.join(outputDir, `${fileName}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  if (fs.existsSync(fontPath)) {
      doc.font(fontPath); 
  } else {
      console.warn('Шрифт не знайдено, використовується стандартний (кирилиця не відображатиметься)!');
  }

  // Заголовок
  doc.fontSize(18).text(`Результати аналізу файлу: ${fileName}`, { align: 'center' });
  doc.text('\n');

  // Статистика
  doc.fontSize(12).text('Основні характеристики:', { underline: true });
  for (const [key, value] of Object.entries(statistics)) {
    doc.text(`${key}: ${value}`);
  }
  doc.text('\n');

  // Графіки — використовуємо буфер замість тимчасових файлів
  for (const graph of graphs) {
    if (!graph || !graph.imageBase64) continue;

    // Очистка префіксу та створення буфера
    const base64Data = graph.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    let imgBuffer;
    try {
      imgBuffer = Buffer.from(base64Data, 'base64');
    } catch (e) {
      // Некоректні дані зображення — пропускаємо графік
      doc.addPage();
      doc.fontSize(12).text(`Не вдалося вставити графік: ${graph.name}`);
      continue;
    }

    doc.addPage();
    doc.fontSize(14).text(`Графік: ${graph.name}`, { align: 'center' });
    // якщо pdfkit не зможе розпізнати формат — спіймаємо помилку нижче
    try {
      doc.image(imgBuffer, { fit: [500, 350], align: 'center' });
    } catch (e) {
      doc.moveDown();
      doc.fontSize(10).text(`Помилка при вставці зображення (${graph.name}): ${e.message}`);
    }
  }

  doc.end();

  // Повертаємо шлях після завершення запису
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', (err) => reject(err));
  });
};