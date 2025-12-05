import { useAnalysisStore } from '@src/store';

function StatisticsBlock() {
    const { data } = useAnalysisStore();
    const stats = data?.statistics || {};

    return (
        <section className="statistics">
            <div className="statistics__title"> Statistics </div>

            <div className="stat__list">
                <label> Mean Phase </label>
                <div className="stat__value"> {stats.mean_phase ?? '--'} </div>

                <label> Phase Variance </label>
                <div className="stat__value"> {stats.phase_variance ?? '--'} </div>

                <label> Coherence </label>
                <div className="stat__value"> 
                    {stats.coherence === null ? 'N/A' : (stats.coherence ?? '--')} 
                </div>

                <label> Phase Distribution Entropy </label>
                <div className="stat__value"> {stats.phase_entropy ?? '--'} </div>

                <label> Circular Mean </label>
                <div className="stat__value"> {stats.circular_mean ?? '--'} </div>

                <label> Circular Variance </label>
                <div className="stat__value"> {stats.circular_variance ?? '--'} </div>

                <label> Amplitude-Weighted Average </label>
                <div className="stat__value"> {stats.amplitude_weighted_average ?? '--'} </div>

                <label> Number of Phase Transitions </label>
                <div className="stat__value"> {stats.phase_transition_count ?? '--'} </div>
            </div>
        </section>
    );
}

export default StatisticsBlock;