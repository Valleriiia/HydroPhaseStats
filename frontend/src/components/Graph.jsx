import { useEffect, useRef } from 'react';

function Graph({ data, type = 'line', color = '#57E0E9', height = 250, title }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Адаптивний розмір
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const w = rect.width;
    const h = height;

    // Очистка
    ctx.clearRect(0, 0, w, h);

    // Стилі
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.font = '10px Century Gothic';

    if (type === 'line' && data.x && data.y) {
      drawLineChart(ctx, w, h, data.x, data.y);
    } else if (type === 'bar' && data.x && data.y) {
      drawBarChart(ctx, w, h, data.x, data.y);
    } else if (type === 'polar' && data.angles && data.magnitudes) {
      drawPolarChart(ctx, w, h, data.angles, data.magnitudes);
    } else if (type === 'heatmap' && data.matrix) {
      drawHeatmap(ctx, w, h, data.matrix);
    } else if (type === 'text') {
        ctx.fillStyle = '#fff';
        ctx.font = '14px Century Gothic';
        ctx.textAlign = 'center';
        ctx.fillText(data.text || 'No Data', w/2, h/2);
    }

  }, [data, type, color, height]);

  // --- Функції малювання ---

  const drawLineChart = (ctx, w, h, x, y) => {
    if (!x.length) return;
    const padding = 20;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;

    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    const rangeY = maxY - minY || 1;

    ctx.beginPath();
    ctx.moveTo(padding, padding + drawH - ((y[0] - minY) / rangeY) * drawH);

    for (let i = 1; i < x.length; i++) {
      const xPos = padding + (i / (x.length - 1)) * drawW;
      const yPos = padding + drawH - ((y[i] - minY) / rangeY) * drawH;
      ctx.lineTo(xPos, yPos);
    }
    ctx.stroke();
  };

  const drawBarChart = (ctx, w, h, x, y) => {
    if (!x.length) return;
    const padding = 20;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;
    const maxY = Math.max(...y) || 1;
    const barWidth = drawW / x.length;

    for (let i = 0; i < x.length; i++) {
        const barHeight = (y[i] / maxY) * drawH;
        const xPos = padding + i * barWidth;
        const yPos = padding + drawH - barHeight;
        ctx.fillRect(xPos, yPos, barWidth - 1, barHeight);
    }
  };

  const drawPolarChart = (ctx, w, h, angles, magnitudes) => {
     const centerX = w / 2;
     const centerY = h / 2;
     const radius = Math.min(w, h) / 2 - 20;
     const maxMag = Math.max(...magnitudes) || 1;

     ctx.beginPath();
     for (let i = 0; i < angles.length; i++) {
         const r = (magnitudes[i] / maxMag) * radius;
         const angle = angles[i]; // радіани
         // Polar to Cartesian
         const x = centerX + r * Math.cos(angle);
         const y = centerY + r * Math.sin(angle); // +Y вниз на canvas, але для візуалізації ок
         if (i === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
     }
     ctx.closePath();
     ctx.stroke();
     ctx.globalAlpha = 0.2;
     ctx.fill();
     ctx.globalAlpha = 1.0;
  };
  
  const drawHeatmap = (ctx, w, h, matrix) => {
      // matrix[freq][time]
      const rows = matrix.length; // freq bins
      if (!rows) return;
      const cols = matrix[0].length; // time bins
      
      const cellW = w / cols;
      const cellH = h / rows;
      
      // Знаходимо мін/макс для нормалізації кольору
      // Для швидкості припустимо діапазон -PI..PI для фази
      const minVal = -Math.PI;
      const maxVal = Math.PI;
      
      for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
              const val = matrix[r][c];
              // Нормалізація 0..1
              let norm = (val - minVal) / (maxVal - minVal);
              
              // Проста карта кольорів: Синій (0) -> Червоний (1)
              const red = Math.floor(norm * 255);
              const blue = 255 - red;
              
              ctx.fillStyle = `rgb(${red}, 0, ${blue})`;
              // r=0 - це зазвичай низькі частоти, малюємо знизу вгору
              ctx.fillRect(c * cellW, h - (r + 1) * cellH, cellW + 0.5, cellH + 0.5);
          }
      }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      {title && <div style={{color: '#fff', fontSize: '12px', marginBottom: '5px', textAlign: 'center'}}>{title}</div>}
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Graph;