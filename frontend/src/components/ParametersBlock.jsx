function ParametersBlock()
{
	return(
		<section className="parameters">
			<div className="parameters__title"> Parameters </div>

			<div className="parameters__container">
				<div className="parameters__minititle"> FFT Window </div>
				<div className="parameters__list">
					<label><input type="radio" name="fftWindow" value="hamming" checked/> Hamming window </label><br/>
					<label><input type="radio" name="fftWindow" value="hanning"/> Hanning window </label><br/>
					<label><input type="radio" name="fftWindow" value="blackman"/> Blackman </label><br/>
				</div>
			</div>

			<div className="parameters__container">
				<div className="parameters__minititle"> STFT </div>
				<div className="parameters__list">
					<label><input type="radio" name="stftWindow" value="256points" checked/> 256 points </label><br/>
					<label><input type="radio" name="stftWindow" value="512points"/> 512 points </label><br/>
					<label><input type="radio" name="stftWindow" value="1024points"/> 1024 points </label><br/>
				</div>
			</div>

			<div className="parameters__container">
				<div className="parameters__minititle"> Signal Normalization </div>
				<div className="parameters__list">
					<label><input type="radio" name="signalNormalization" value="nonormalization" checked/> No normalization
					</label><br/>
					<label><input type="radio" name="signalNormalization" value="scale"/> Scale -1...1 </label><br/>
					<label><input type="radio" name="signalNormalization" value="indecibels"/> In decibels (dB) </label><br/>
				</div>
			</div>
		</section>
	);
}


export default ParametersBlock;