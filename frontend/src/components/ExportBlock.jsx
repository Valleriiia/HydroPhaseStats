import { useState } from 'react';
import { useResultPresenceStore, useModalStore, useAnalysisStore } from '@src/store';
import { exportPDF, exportPNG } from '@src/api';
import { drawLineChart, drawBarChart, drawPolarChart, drawHeatmap, drawText } from '../utils/graphUtils';

function ExportBlock() {
  const { hasResult } = useResultPresenceStore();

  const { data, originalFileName } = useAnalysisStore(); 
  const { open: showModal } = useModalStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('png');

  const generateGraphImage = (drawFn, width, height, ...args) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a1a'; 
    ctx.fillRect(0, 0, width, height);
    
    drawFn(ctx, width, height, ...args);
    return canvas.toDataURL('image/png');
  };

  const generateAllGraphs = () => {
    if (!data) return [];
    
    const graphs = [];
    const w = 800; 
    const h = 400; 

    if (data.waveform) {
        const img = generateGraphImage(drawLineChart, w, h, data.waveform.time, data.waveform.amplitude, '#57E0E9');
        graphs.push({ name: 'Oscillogram', imageBase64: img });
    }
    if (data.amplitude_spectrum) {
        const img = generateGraphImage(drawLineChart, w, h, data.amplitude_spectrum.frequency, data.amplitude_spectrum.magnitude, '#B367FC');
        graphs.push({ name: 'Amplitude Spectrum', imageBase64: img });
    }
    if (data.phase_spectrum) {
        const img = generateGraphImage(drawLineChart, w, h, data.phase_spectrum.frequency, data.phase_spectrum.phase, '#B367FC');
        graphs.push({ name: 'Phase Spectrum', imageBase64: img });
    }
    if (data.phasegram) {
        const img = generateGraphImage(drawHeatmap, w, h, data.phasegram.phase_matrix);
        graphs.push({ name: 'Phasegram', imageBase64: img });
    }
    if (data.phase_histogram) {
        const x = data.phase_histogram.counts.map((_, i) => i);
        const img = generateGraphImage(drawBarChart, w, h, x, data.phase_histogram.counts, '#B367FC');
        graphs.push({ name: 'Phase Histogram', imageBase64: img });
    }
    if (data.phase_rose_plot) {
        const img = generateGraphImage(drawPolarChart, w, h, data.phase_rose_plot.angles, data.phase_rose_plot.magnitudes, '#B367FC');
        graphs.push({ name: 'Rose Plot', imageBase64: img });
    }
    
    const coh = data.statistics?.coherence;
    const text = coh !== null ? `Coherence: ${coh}` : 'Coherence: N/A (Mono Signal)';
    const img = generateGraphImage(drawText, w, h, text);
    graphs.push({ name: 'Coherence', imageBase64: img });

    return graphs;
  };

  const handleDownload = async () => {
    if (!hasResult || isExporting || !data) return;
    
    setIsExporting(true);
    
    try {
      const nameWithoutExt = originalFileName 
          ? originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName
          : 'analysis';
      
      const fileName = `${nameWithoutExt}_analysis`;
      
      if (format === 'json') {
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          downloadBlob(blob, `${fileName}.json`);
      } 
      else if (format === 'csv') {
          let csvContent = "data:text/csv;charset=utf-8,";
          
          csvContent += "--- CHARACTERISTICS ---\nMetric,Value\n";
          Object.entries(data.characteristics || {}).forEach(([key, val]) => csvContent += `${key},${val}\n`);
          
          csvContent += "\n--- STATISTICS ---\nMetric,Value\n";
          Object.entries(data.statistics || {}).forEach(([key, val]) => csvContent += `${key},${val}\n`);

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
      else {
          const graphs = generateAllGraphs();
          
          const payload = {
              fileName,
              graphs,
              statistics: data.statistics,
              characteristics: data.characteristics 
          };

          let blob;
          if (format === 'pdf') {
              blob = await exportPDF(payload);
          } else { 
              blob = await exportPNG(payload);
          }
          
          const ext = format === 'png' ? 'zip' : 'pdf';
          downloadBlob(blob, `${fileName}.${ext}`);
      }
    }
    catch (err) {
      console.error(err);
      showModal('Export error', { text: err.message || 'Unknown error' });
    }
    finally {
      setIsExporting(false);
    }
  };
  
  const downloadBlob = (blob, filename) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  };

  return(
    <section className="export">
      <div className="export__title">Export</div>
      <div className="export__controls">
        <button 
          id="download" 
          onClick={handleDownload}
          disabled={!hasResult || isExporting}
          className={isExporting ? 'exporting' : ''}
        >
          {isExporting ? 'Exporting...' : 'Download'}
        </button>
        
        <select 
          id="format" 
          disabled={!hasResult || isExporting}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="png">PNG</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </section>
  );
}

export default ExportBlock;