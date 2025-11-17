import soundfile as sf
import numpy as np
from scipy.fft import rfft, rfftfreq 
from scipy.signal import stft

def get_spectra(file_path):
    """
    Обчислює амплітудний та фазовий спектри сигналу.
    """
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО 
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # 2. Виконуємо FFT
        N = len(mono_signal)
        yf = rfft(mono_signal)
        xf = rfftfreq(N, 1 / samplerate)

        # 3. Отримуємо Магнітуду (Амплітудний спектр)
        magnitude = np.abs(yf)
        
        # 4. Отримуємо Фазу (Фазовий спектр)
        phase = np.angle(yf)

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
        return {
            "phasegram": {
                "time_axis": [],
                "frequency_axis": [],
                "phase_matrix": [[]] 
            }
        }