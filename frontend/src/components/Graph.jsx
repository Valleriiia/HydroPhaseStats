import { useEffect, useRef } from 'react';
import { drawLineChart, drawBarChart, drawPolarChart, drawHeatmap, drawText } from '../utils/graphUtils';

function Graph({ data, type = 'line', color = '#57E0E9', height = 250, title = null }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.clearRect(0, 0, w, h);

    if (type === 'line' && data.x && data.y) {
      drawLineChart(ctx, w, h, data.x, data.y, color);
    } else if (type === 'bar' && data.x && data.y) {
      drawBarChart(ctx, w, h, data.x, data.y, color);
    } else if (type === 'polar' && data.angles && data.magnitudes) {
      drawPolarChart(ctx, w, h, data.angles, data.magnitudes, color);
    } else if (type === 'heatmap' && data.matrix) {
      drawHeatmap(ctx, w, h, data.matrix);
    } else if (type === 'text') {
      drawText(ctx, w, h, data.text);
    }

  }, [data, type, color, height]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      {title && <div style={{color: '#fff', fontSize: '12px', marginBottom: '5px', textAlign: 'center'}}>{title}</div>}
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Graph;