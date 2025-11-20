import soundfile as sf
import numpy as np
from scipy.fft import rfft, rfftfreq
from scipy.signal import stft
import sys

MAX_POINTS = 5000 # Максимальна кількість точок, яку повернемо для масивів спектра
MAX_STFT_TIME_POINTS = 200 # Максимальна кількість часових зрізів для фазограми

def _decimate_arrays(arr, max_len):
    """
    Допоміжна функція для проріджування масивів до заданої довжини.
    """
    current_len = arr.shape[0]
    if current_len > max_len:
        step = current_len // max_len
        return arr[::step]
    return arr


def get_spectra(file_path):
    """
    Обчислює амплітудний та фазовий спектри сигналу.
    """
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО (критично для FFT)
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # 2. Виконуємо FFT
        N = len(mono_signal)
        yf = rfft(mono_signal)
        
        # rfftfreq - обчислює правильні частоти для rfft
        xf = rfftfreq(N, 1 / samplerate)

        # 3. Отримуємо Магнітуду (Амплітудний спектр)
        magnitude = np.abs(yf)
        
        # 4. Отримуємо Фазу (Фазовий спектр)
        phase = np.angle(yf)

        xf = _decimate_arrays(xf, MAX_POINTS)
        magnitude = _decimate_arrays(magnitude, MAX_POINTS)
        phase = _decimate_arrays(phase, MAX_POINTS)
        
        # Округлюємо для зменшення розміру рядків у JSON
        xf = np.round(xf, 2)
        magnitude = np.round(magnitude, 4)
        phase = np.round(phase, 4)
        
        # 5. Пакуємо у JSON-friendly формат (.tolist())
        amplitude_spectrum = {
            "frequency": xf.tolist(),
            "magnitude": magnitude.tolist()
        }
        
        phase_spectrum = {
            "frequency": xf.tolist(),
            "phase": phase.tolist()
        }

        return {
            "amplitude_spectrum": amplitude_spectrum,
            "phase_spectrum": phase_spectrum
        }

    except Exception as e:
        print(f"Error in get_spectra: {e}", file=sys.stderr)
        # Повертаємо порожню структуру, щоб тест впав коректно
        return {
            "amplitude_spectrum": {"frequency": [], "magnitude": []},
            "phase_spectrum": {"frequency": [], "phase": []}
        }


def get_phasegram(file_path):
    """
    Обчислює фазограму (STFT) сигналу.
    """
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # 2. Виконуємо STFT (Short-Time Fourier Transform)
        f, t, Zxx = stft(mono_signal, fs=samplerate, nperseg=1024)

        # 3. Отримуємо фазову матрицю
        phase_matrix = np.angle(Zxx)

        # --- КРИТИЧНА ОПТИМІЗАЦІЯ: КОНТРОЛЬ РОЗМІРУ МАТРИЦІ ---
        # Обмежуємо кількість частотних точок до MAX_POINTS
        f_len = f.shape[0]
        if f_len > MAX_POINTS:
            f_step = f_len // MAX_POINTS
            f = f[::f_step]
            phase_matrix = phase_matrix[::f_step, :] # Обрізаємо рядки (частоти)
        
        # Обмежуємо кількість часових зрізів (стовпців)
        t_len = t.shape[0]
        if t_len > MAX_STFT_TIME_POINTS:
            t_step = t_len // MAX_STFT_TIME_POINTS
            t = t[::t_step]
            phase_matrix = phase_matrix[:, ::t_step] # Обрізаємо стовпці (час)

        # Округлюємо
        t = np.round(t, 2)
        f = np.round(f, 1)
        phase_matrix = np.round(phase_matrix, 4)

        # 4. Пакуємо у JSON-friendly формат (.tolist())
        phasegram = {
            "time_axis": t.tolist(),
            "frequency_axis": f.tolist(),
            "phase_matrix": phase_matrix.tolist()
        }

        return {
            "phasegram": phasegram
        }

    except Exception as e:
        print(f"Error in get_phasegram: {e}", file=sys.stderr)
        # Повертаємо порожню структуру, щоб тест впав коректно
        return {
            "phasegram": {
                "time_axis": [],
                "frequency_axis": [],
                "phase_matrix": [[]] # Матриця має бути 2D
            }
        }
