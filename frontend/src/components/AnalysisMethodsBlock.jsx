function AnalysisMethodsBlock()
{
	return(
		<section className="methodsOfAnalysis">
			<div className="methodsOfAnalysis__title">Methods Of Analysis</div>
			<div className="methods__buttons">
				<button id="method" className="active">Oscillogram</button>
				<button id="method">Amplitude</button>
				<button id="method">Phase spectrum FFT</button>
				<button id="method">Heatmap</button>
				<button id="method">Phase histogram</button>
				<button id="method">Rose-plot</button>
				<button id="method">Coherence</button>
			</div>
		</section>
	);
}


export default AnalysisMethodsBlock;