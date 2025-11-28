import { useState } from 'react';
import { useResultPresenceStore, useModalStore } from '@src/store';
import { exportPDF, exportPNG } from '@src/api';


function ExportBlock()
{
  const { hasResult } = useResultPresenceStore();
  const { open: showModal } = useModalStore();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('png');
  

  const handleDownload = async () => {
    if (!hasResult || isExporting) return;
    
    setIsExporting(true);
    
    try
    {
      let blob;
      
      const mockData = {
        graphs: [],
        statistics: {},
        fileName: `analysis_${Date.now()}`
      };
      
      if (format === 'png')
			{
        blob = await exportPNG(mockData);
      }
			else if (format === 'pdf')
			{
        blob = await exportPDF(mockData);
      }
			else
			{
        throw new Error('Формат не підтримується');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${Date.now()}.${format === 'png' ? 'zip' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    catch (err)
    {
      showModal('Export error', { text: err.message || 'Unknown error' });
    }
    finally
    {
      setIsExporting(false);
    }
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