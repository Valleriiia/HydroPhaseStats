import { useAnalysisStore } from '@src/store';
import Graph from './Graph';

function SpectrumBlock() {
  const { data, selectedMethod } = useAnalysisStore();

  let content = <div className="no_file"> No file to analyze </div>;
  let title = "Spectrum";

  if (data) {
    let graphData = null;
    let graphType = 'line';
    let graphColor = '#B367FC'; 

    switch (selectedMethod) {
      case 'oscillogram':
        title = "Oscillogram";
        graphData = { x: data.waveform.time, y: data.waveform.amplitude };
        graphType = 'line';
        graphColor = '#57E0E9'; 
        break;
      case 'amplitude':
        title = "Amplitude Spectrum";
        graphData = { x: data.amplitude_spectrum.frequency, y: data.amplitude_spectrum.magnitude };
        graphType = 'line';
        break;
      case 'phase':
        title = "Phase Spectrum";
        graphData = { x: data.phase_spectrum.frequency, y: data.phase_spectrum.phase };
        graphType = 'line';
        break;
      case 'heatmap':
        title = "Phasegram (Heatmap)";
        graphData = { matrix: data.phasegram.phase_matrix };
        graphType = 'heatmap';
        break;
      case 'histogram':
        title = "Phase Histogram";
        graphData = { x: data.phase_histogram.counts.map((_, i) => i), y: data.phase_histogram.counts };
        graphType = 'bar';
        break;
      case 'rose':
        title = "Rose Plot";
        graphData = { angles: data.phase_rose_plot.angles, magnitudes: data.phase_rose_plot.magnitudes };
        graphType = 'polar';
        break;
      case 'coherence': { 
        title = "Coherence";
        const val = data.statistics.coherence;
        graphData = { text: val !== null ? `Coherence: ${val}` : 'Coherence: N/A (Mono Signal)' };
        graphType = 'text';
        break;
      } 
      default:
        graphData = null;
    }

    if (graphData) {
      content = (
        <Graph 
          data={graphData} 
          type={graphType} 
          color={graphColor} 
          height={220} 
        />
      );
    }
  }

  return (
    <section className="spectrum">
      <div className="spectrum__title"> {title} </div>
      {content}
    </section>
  );
}

export default SpectrumBlock;