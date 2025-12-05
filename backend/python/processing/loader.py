import soundfile as sf
import numpy as np
import os
import sys

def _parse_bit_depth(subtype_str):
    if 'PCM_16' in subtype_str: return 16
    if 'PCM_24' in subtype_str: return 24
    if 'PCM_32' in subtype_str: return 32
    if 'FLOAT' in subtype_str: return 32
    return 0

def get_characteristics(file_path):
    try:
        info = sf.info(file_path)
        signal, samplerate = sf.read(file_path, dtype='float32') 
        
        if info.channels > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal
            
        abs_signal = np.abs(mono_signal)
        max_amplitude = float(np.max(abs_signal))
        avg_amplitude = float(np.mean(abs_signal))

        return {
            "sampling_rate": info.samplerate,
            "num_channels": info.channels,
            "bit_depth": _parse_bit_depth(info.subtype),
            "signal_length_seconds": round(float(info.frames) / info.samplerate, 3),
            "num_samples": info.frames,
            "file_size_bytes": os.path.getsize(file_path),
            "max_amplitude": round(max_amplitude, 5),
            "avg_amplitude": round(avg_amplitude, 5)
        }
    except Exception as e:
        print(f"Error in get_characteristics: {e}", file=sys.stderr)
        return {}

def get_waveform(file_path, max_points=5000, normalization='nonormalization'):
    """
    Завантажує сигнал, нормалізує і повертає дані для осцилограми.
    """
    try:
        info = sf.info(file_path)
        signal, samplerate = sf.read(file_path, dtype='float32')

        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        # --- НОРМАЛІЗАЦІЯ ---
        if normalization == 'scale':
            # Масштабування до -1..1 (Peak Normalization)
            peak = np.max(np.abs(mono_signal))
            if peak > 0:
                mono_signal = mono_signal / peak
        elif normalization == 'indecibels':
            # Переведення в дБ
            # Додаємо epsilon, щоб не було log(0)
            mono_signal = 20 * np.log10(np.abs(mono_signal) + 1e-9)
            # Обрізаємо дуже низькі значення для краси (наприклад -120 дБ)
            mono_signal = np.maximum(mono_signal, -120)

        num_samples_original = len(mono_signal)

        # Децимація
        if num_samples_original > max_points:
            step = num_samples_original // max_points
            mono_signal = mono_signal[::step]

        num_points_final = len(mono_signal)
        total_duration_seconds = float(info.frames) / info.samplerate
        time_axis = np.linspace(0, total_duration_seconds, num_points_final)

        return {
            "time": np.round(time_axis, 4).tolist(),
            "amplitude": np.round(mono_signal, 5).tolist()
        }

    except Exception as e:
        print(f"Error in get_waveform: {e}", file=sys.stderr)
        return {"time": [], "amplitude": []}