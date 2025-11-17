import soundfile as sf
import numpy as np
from scipy.fft import rfft
from scipy.stats import entropy, circmean, circvar

def _calculate_entropy(data, bins=36):
    """Допоміжна функція для розрахунку ентропії фаз."""
    # 1. Створюємо гістограму
    counts, bin_edges = np.histogram(data, bins=bins, range=(-np.pi, np.pi))
    
    # 2. Нормалізуємо, щоб отримати ймовірності
    probabilities = counts / counts.sum()
    
    # 3. Розраховуємо ентропію
    return entropy(probabilities + 1e-9)

def get_statistics(file_path):
    """
    Обчислює статистичний аналіз фаз (п. 9 ТЗ).
    """
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # 2. Виконуємо FFT
        yf = rfft(mono_signal)
        
        # 3. Отримуємо фазу та амплітуду
        phases = np.angle(yf)
        magnitudes = np.abs(yf)

        # 4. Розраховуємо метрики
        mean_phase = float(np.mean(phases))
        phase_variance = float(np.var(phases))
        coherence = None 
        phase_entropy = float(_calculate_entropy(phases))
        c_mean = float(circmean(phases))
        c_var = float(circvar(phases))
        avg_weighted = float(np.average(phases, weights=magnitudes + 1e-9))
        phase_diffs = np.abs(np.diff(phases))
        transition_count = int(np.sum(phase_diffs > (np.pi / 2)))

        # 5. Пакуємо результат (і очищуємо від NaN)
        stats = {
            "mean_phase": np.nan_to_num(mean_phase),
            "phase_variance": np.nan_to_num(phase_variance),
            "coherence": coherence,
            "phase_entropy": np.nan_to_num(phase_entropy),
            "circular_mean": np.nan_to_num(c_mean),
            "circular_variance": np.nan_to_num(c_var),
            "amplitude_weighted_average": np.nan_to_num(avg_weighted),
            "phase_transition_count": transition_count
        }
        
        return {"statistics": stats}

    except Exception as e:
        print(f"Error in get_statistics: {e}", file=sys.stderr)
        return {"statistics": {}}
    
def get_phase_histograms(file_path, bins=36):
    """
    Обчислює фазову гістограму та дані для rose plot (п. 7 і 8 ТЗ).
    """
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # 2. Виконуємо FFT
        yf = rfft(mono_signal)
        
        # 3. Отримуємо фазу
        phases = np.angle(yf)

        # 4. Розраховуємо гістограму
        counts, bin_edges = np.histogram(
            phases, 
            bins=bins, 
            range=(-np.pi, np.pi)
        )

        # 5. Готуємо дані для "Rose Plot"
        bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2.0
        
        # 6. Пакуємо результат
        phase_histogram = {
            "bins": bin_edges.tolist(), 
            "counts": counts.tolist()
        }
        
        phase_rose_plot = {
            "angles": bin_centers.tolist(),
            "magnitudes": counts.tolist()
        }

        return {
            "phase_histogram": phase_histogram,
            "phase_rose_plot": phase_rose_plot
        }

    except Exception as e:
        print(f"Error in get_phase_histograms: {e}", file=sys.stderr)
        return {
            "phase_histogram": {"bins": [], "counts": []},
            "phase_rose_plot": {"angles": [], "magnitudes": []}
        }