import { useAnalysisStore } from '@src/store';

function CharacteristicsBlock() {
    // Дістаємо дані зі стору
    const { data } = useAnalysisStore();
    
    // Якщо даних немає (null), виводимо "--". Якщо є — беремо з об'єкта characteristics
    const chars = data?.characteristics || {};

    return (
        <section className="characteristicsOfSignal">
            <div className="characteristicsOfSignal__title"> Characteristics Of Signal </div>

            <div className="chars__list">
                <label> Sampling Rate </label>
                <div className="chars__value"> {chars.sampling_rate ?? '--'} </div>

                <label> Number of Channels </label>
                <div className="chars__value"> {chars.num_channels ?? '--'} </div>

                <label> Bit Depth </label>
                <div className="chars__value"> {chars.bit_depth ? `${chars.bit_depth} bit` : '--'} </div>

                <label> Signal Length </label>
                <div className="chars__value"> {chars.signal_length_seconds ? `${chars.signal_length_seconds} s` : '--'} </div>

                <label> Number of Samples </label>
                <div className="chars__value"> {chars.num_samples ?? '--'} </div>

                <label> File Size </label>
                <div className="chars__value"> {chars.file_size_bytes ? `${chars.file_size_bytes} bytes` : '--'} </div>

                <label> Maximum Amplitude </label>
                <div className="chars__value"> {chars.max_amplitude ?? '--'} </div>

                <label> Average Amplitude </label>
                <div className="chars__value"> {chars.avg_amplitude ?? '--'} </div>
            </div>
        </section>
    );
}

export default CharacteristicsBlock;