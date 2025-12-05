function StatisticsBlock()
{
	return(
		<section className="statistics">
			<div className="statistics__title"> Statistics </div>

			<div className="stat__list">
				<label> Mean Phase </label>
				<div className="stat__value" id="meanPhase"> -- </div>

				<label> Phase Variance </label>
				<div className="stat__value" id="phaseVariance"> -- </div>

				<label> Coherence </label>
				<div className="stat__value" id="coherence"> -- </div>

				<label> Phase Distribution Entropy </label>
				<div className="stat__value" id="phaseDistributionEntropy"> -- </div>

				<label> Circular Mean </label>
				<div className="stat__value" id="circularMean"> -- </div>

				<label> Circular Variance </label>
				<div className="stat__value" id="circularVariance"> -- </div>

				<label> Aplitude-Weighted Average </label>
				<div className="stat__value" id="AWA"> -- </div>

				<label> Number of Phase Transitions </label>
				<div className="stat__value" id="numberOfPhaseTransitions"> -- </div>
			</div>
		</section>
	);
}


export default StatisticsBlock;