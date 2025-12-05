import { useAnalysisStore } from '@src/store';

function AnalysisMethodsBlock() {
  const { selectedMethod, setSelectedMethod } = useAnalysisStore();

  const methods = [
    { id: 'oscillogram', label: 'Oscillogram' },
    { id: 'amplitude', label: 'Amplitude' },
    { id: 'phase', label: 'Phase spectrum FFT' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'histogram', label: 'Phase histogram' },
    { id: 'rose', label: 'Rose-plot' },
    { id: 'coherence', label: 'Coherence' },
  ];

  return (
    <section className="methodsOfAnalysis">
      <div className="methodsOfAnalysis__title">Methods Of Analysis</div>
      <div className="methods__buttons">
        {methods.map((method) => (
          <button
            key={method.id}
            id="method"
            className={selectedMethod === method.id ? 'active' : ''}
            onClick={() => setSelectedMethod(method.id)}
          >
            {method.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default AnalysisMethodsBlock;