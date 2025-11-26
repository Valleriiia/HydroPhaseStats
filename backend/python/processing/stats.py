import soundfile as sf
import numpy as np
from scipy.fft import rfft
from scipy.stats import entropy, circmean, circvar
import sys

MAX_POINTS = 5000

def _decimate_array(arr, max_len):
    """
    Допоміжна функція для проріджування масиву до заданої довжини.
    """
    current_len = arr.shape[0]
    if current_len > max_len:
        step = current_len // max_len
        return arr[::step]
    return arr


def _calculate_entropy(data, bins=36):
    """Допоміжна функція для розрахунку ентропії фаз."""
    # 1. Створюємо гістограму
    counts, bin_edges = np.histogram(data, bins=bins, range=(-np.pi, np.pi))
    
    # 2. Нормалізуємо, щоб отримати ймовірності
    probabilities = counts / counts.sum()
    
    # 3. Розраховуємо ентропію
    # (додаємо +1e-9, щоб уникнути log(0))
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

        # --- КРИТИЧНА ОПТИМІЗАЦІЯ: ДЕЦИМАЦІЯ ---
        # Обмежуємо масиви для статистики
        phases = _decimate_array(phases, MAX_POINTS)
        magnitudes = _decimate_array(magnitudes, MAX_POINTS)

        # 4. Розраховуємо метрики
        
        # Проста статистика
        mean_phase = float(np.mean(phases))
        phase_variance = float(np.var(phases))

        # Когерентність - НЕМОЖЛИВА для одного каналу
        coherence = None 

        # Ентропія
        phase_entropy = float(_calculate_entropy(phases))

        # Кругова статистика
        c_mean = float(circmean(phases))
        c_var = float(circvar(phases))

        # Амплітудно-зважене середнє
        # (додаємо +1e-9, щоб уникнути ділення на 0, якщо тиша)
        avg_weighted = float(np.average(phases, weights=magnitudes + 1e-9))

        # Кількість переходів фази (простий метод)
        # Рахуємо, скільки разів різниця фаз > pi/2
        phase_diffs = np.abs(np.diff(phases))
        transition_count = int(np.sum(phase_diffs > (np.pi / 2)))

        # 5. Пакуємо результат (і очищуємо від NaN)
        # Округлюємо всі фінальні значення до 4 знаків після коми
        stats = {
            "mean_phase": round(np.nan_to_num(mean_phase), 4),
            "phase_variance": round(np.nan_to_num(phase_variance), 4),
            "coherence": coherence,
            "phase_entropy": round(np.nan_to_num(phase_entropy), 4),
            "circular_mean": round(np.nan_to_num(c_mean), 4),
            "circular_variance": round(np.nan_to_num(c_var), 4),
            "amplitude_weighted_average": round(np.nan_to_num(avg_weighted), 4),
            "phase_transition_count": transition_count
        }
        
        return {"statistics": stats}

    except Exception as e:
        print(f"Error in get_statistics: {e}", file=sys.stderr)
        # Повертаємо порожню структуру, щоб тест впав коректно
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
        
        # --- КРИТИЧНА ОПТИМІЗАЦІЯ: ДЕЦИМАЦІЯ ---
        phases = _decimate_array(phases, MAX_POINTS)

        # 4. Розраховуємо гістограму
        counts, bin_edges = np.histogram(
            phases, 
            bins=bins, 
            range=(-np.pi, np.pi)
        )

        # 5. Готуємо дані для "Rose Plot"
        bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2.0
        
        # Округлення
        bin_edges = np.round(bin_edges, 4)
        bin_centers = np.round(bin_centers, 4)
        
        # 6. Пакуємо результат
        phase_histogram = {
            "bins": bin_edges.tolist(), # Межі
            "counts": counts.tolist()
        }
        
        phase_rose_plot = {
            "angles": bin_centers.tolist(), # Cередини
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
