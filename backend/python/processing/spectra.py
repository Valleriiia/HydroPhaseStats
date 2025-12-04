import soundfile as sf
import numpy as np
from scipy.fft import rfft, rfftfreq
from scipy.signal import stft, get_window
import sys

MAX_POINTS = 5000 
MAX_STFT_TIME_POINTS = 200 

def _decimate_arrays(arr, max_len):
    current_len = arr.shape[0]
    if current_len > max_len:
        step = current_len // max_len
        return arr[::step]
    return arr

def get_spectra(file_path, window_type='hamming'):
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        N = len(mono_signal)
        
        # Застосовуємо вікно до всього сигналу для FFT (якщо потрібно)
        # Хоча для чистого спектру всього файлу це рідко роблять, 
        # але для навчальних цілей реалізуємо:
        try:
            win = get_window(window_type, N)
            mono_signal = mono_signal * win
        except:
            pass # Якщо вікно невідоме, ігноруємо

        yf = rfft(mono_signal)
        xf = rfftfreq(N, 1 / samplerate)

        magnitude = np.abs(yf)
        phase = np.angle(yf)

        xf = _decimate_arrays(xf, MAX_POINTS)
        magnitude = _decimate_arrays(magnitude, MAX_POINTS)
        phase = _decimate_arrays(phase, MAX_POINTS)
        
        return {
            "amplitude_spectrum": {
                "frequency": np.round(xf, 2).tolist(),
                "magnitude": np.round(magnitude, 4).tolist()
            },
            "phase_spectrum": {
                "frequency": np.round(xf, 2).tolist(),
                "phase": np.round(phase, 4).tolist()
            }
        }
    except Exception as e:
        print(f"Error in get_spectra: {e}", file=sys.stderr)
        return { "amplitude_spectrum": {"frequency":[],"magnitude":[]}, "phase_spectrum": {"frequency":[],"phase":[]} }

def get_phasegram(file_path, window_type='hamming', nperseg=256):
    try:
        signal, samplerate = sf.read(file_path, dtype='float32')
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # Використовуємо параметри STFT
        f, t, Zxx = stft(mono_signal, fs=samplerate, window=window_type, nperseg=nperseg)

        phase_matrix = np.angle(Zxx)

        f_len = f.shape[0]
        if f_len > MAX_POINTS:
            f_step = f_len // MAX_POINTS
            f = f[::f_step]
            phase_matrix = phase_matrix[::f_step, :]
        
        t_len = t.shape[0]
        if t_len > MAX_STFT_TIME_POINTS:
            t_step = t_len // MAX_STFT_TIME_POINTS
            t = t[::t_step]
            phase_matrix = phase_matrix[:, ::t_step]

        return {
            "phasegram": {
                "time_axis": np.round(t, 2).tolist(),
                "frequency_axis": np.round(f, 1).tolist(),
                "phase_matrix": np.round(phase_matrix, 4).tolist()
            }
        }
    except Exception as e:
        print(f"Error in get_phasegram: {e}", file=sys.stderr)
        return { "phasegram": { "time_axis": [], "frequency_axis": [], "phase_matrix": [[]] } }