function CharacteristicsBlock()
{
	return(
		<section className="characteristicsOfSignal">
			<div className="characteristicsOfSignal__title"> Characteristics Of Signal </div>

			<div className="chars__list">
				<label> Sampling Rate </label>
				<div className="chars__value" id="samplingRate"> -- </div>

				<label> Number of Channels </label>
				<div className="chars__value" id="numberOfChannels"> -- </div>

				<label> Bit Depth </label>
				<div className="chars__value" id="bitDepth"> -- </div>

				<label> Signal Length </label>
				<div className="chars__value" id="signalLength"> -- </div>

				<label> Number of Samples </label>
				<div className="chars__value" id="numberOfSamples"> -- </div>

				<label> File Size </label>
				<div className="chars__value" id="fileSize"> -- </div>

				<label> Maximum Amplitude </label>
				<div className="chars__value" id="maximumAmplitude"> -- </div>

				<label> Average Amplitude </label>
				<div className="chars__value" id="averageAmplitude"> -- </div>
			</div>
		</section>
	);
}


export default CharacteristicsBlock;