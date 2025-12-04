import { useParametersStore } from '@src/store';

function ParametersBlock() {
    const { 
        fftWindow, setFftWindow,
        stftWindow, setStftWindow,
        signalNormalization, setSignalNormalization
    } = useParametersStore();

    return (
        <section className="parameters">
            <div className="parameters__title"> Parameters </div>

            <div className="parameters__container">
                <div className="parameters__minititle"> FFT Window </div>
                <div className="parameters__list">
                    <label>
                        <input 
                            type="radio" 
                            name="fftWindow" 
                            value="hamming" 
                            checked={fftWindow === 'hamming'}
                            onChange={(e) => setFftWindow(e.target.value)}
                        /> Hamming window 
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="fftWindow" 
                            value="hanning" 
                            checked={fftWindow === 'hanning'}
                            onChange={(e) => setFftWindow(e.target.value)}
                        /> Hanning window 
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="fftWindow" 
                            value="blackman" 
                            checked={fftWindow === 'blackman'}
                            onChange={(e) => setFftWindow(e.target.value)}
                        /> Blackman 
                    </label><br/>
                </div>
            </div>

            <div className="parameters__container">
                <div className="parameters__minititle"> STFT </div>
                <div className="parameters__list">
                    <label>
                        <input 
                            type="radio" 
                            name="stftWindow" 
                            value="256points" 
                            checked={stftWindow === '256points'}
                            onChange={(e) => setStftWindow(e.target.value)}
                        /> 256 points 
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="stftWindow" 
                            value="512points" 
                            checked={stftWindow === '512points'}
                            onChange={(e) => setStftWindow(e.target.value)}
                        /> 512 points 
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="stftWindow" 
                            value="1024points" 
                            checked={stftWindow === '1024points'}
                            onChange={(e) => setStftWindow(e.target.value)}
                        /> 1024 points 
                    </label><br/>
                </div>
            </div>

            <div className="parameters__container">
                <div className="parameters__minititle"> Signal Normalization </div>
                <div className="parameters__list">
                    <label>
                        <input 
                            type="radio" 
                            name="signalNormalization" 
                            value="nonormalization" 
                            checked={signalNormalization === 'nonormalization'}
                            onChange={(e) => setSignalNormalization(e.target.value)}
                        /> No normalization
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="signalNormalization" 
                            value="scale" 
                            checked={signalNormalization === 'scale'}
                            onChange={(e) => setSignalNormalization(e.target.value)}
                        /> Scale -1...1 
                    </label><br/>
                    <label>
                        <input 
                            type="radio" 
                            name="signalNormalization" 
                            value="indecibels" 
                            checked={signalNormalization === 'indecibels'}
                            onChange={(e) => setSignalNormalization(e.target.value)}
                        /> In decibels (dB) 
                    </label><br/>
                </div>
            </div>
        </section>
    );
}

export default ParametersBlock;