export const drawLineChart = (ctx, w, h, x, y, color) => {
    if (!x || !x.length) return;
    const padding = 40;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;

    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    const rangeY = maxY - minY || 1;

    // Лінія графіка
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const yStart = padding + drawH - ((y[0] - minY) / rangeY) * drawH;
    ctx.moveTo(padding, yStart);

    for (let i = 1; i < x.length; i++) {
        const xPos = padding + (i / (x.length - 1)) * drawW;
        const yPos = padding + drawH - ((y[i] - minY) / rangeY) * drawH;
        ctx.lineTo(xPos, yPos);
    }
    ctx.stroke();
};

export const drawBarChart = (ctx, w, h, x, y, color) => {
    if (!x || !x.length) return;
    const padding = 40;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;
    const maxY = Math.max(...y) || 1;
    const barWidth = drawW / x.length;

    ctx.fillStyle = color;
    for (let i = 0; i < x.length; i++) {
        const barHeight = (y[i] / maxY) * drawH;
        const xPos = padding + i * barWidth;
        const yPos = padding + drawH - barHeight;
        ctx.fillRect(xPos, yPos, barWidth - 1, barHeight);
    }
};

export const drawPolarChart = (ctx, w, h, angles, magnitudes, color) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2 - 40;
    const maxMag = Math.max(...magnitudes) || 1;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < angles.length; i++) {
        const r = (magnitudes[i] / maxMag) * radius;
        const angle = angles[i];
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Заливаємо з прозорістю
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
};

export const drawHeatmap = (ctx, w, h, matrix) => {
    const rows = matrix.length; 
    if (!rows) return;
    const cols = matrix[0].length;
    
    const padding = 20;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;

    const cellW = drawW / cols;
    const cellH = drawH / rows;
    
    const minVal = -Math.PI;
    const maxVal = Math.PI;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const val = matrix[r][c];
            let norm = (val - minVal) / (maxVal - minVal);
            if (norm < 0) norm = 0;
            if (norm > 1) norm = 1;
            
            // Градієнт: Синій -> Червоний
            const red = Math.floor(norm * 255);
            const blue = 255 - red;
            
            ctx.fillStyle = `rgb(${red}, 0, ${blue})`;
            ctx.fillRect(padding + c * cellW, padding + drawH - (r + 1) * cellH, cellW + 0.5, cellH + 0.5);
        }
    }
};

export const drawText = (ctx, w, h, text) => {
    ctx.fillStyle = '#ffffffff';
    ctx.font = 'bold 24px Century Gothic';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'No Data', w/2, h/2);
};