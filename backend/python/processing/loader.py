import soundfile as sf
import numpy as np
import os
import sys

def _parse_bit_depth(subtype_str):
    """
    Допоміжна функція: парсить 'subtype' з soundfile.info для бітності.
    """
    if 'PCM_16' in subtype_str:
        return 16
    if 'PCM_24' in subtype_str:
        return 24
    if 'PCM_32' in subtype_str:
        return 32
    if 'FLOAT' in subtype_str:
        return 32  # 32-bit float
    return 0  # Невідомо

def get_characteristics(file_path):
    """
    Завантажує аудіофайл і повертає його характеристики.
    """
    try:
        # 1. Отримуємо інфо, не читаючи весь файл
        info = sf.info(file_path)
        
        # 2. Читаємо сигнал (як float в діапазоні [-1.0, 1.0])
        signal, samplerate = sf.read(file_path, dtype='float32') 

        # 3. Збираємо характеристики з "info"
        num_channels = info.channels
        num_samples = info.frames
        sampling_rate = info.samplerate
        
        signal_length_seconds = float(num_samples) / samplerate
        bit_depth = _parse_bit_depth(info.subtype)
        
        # 4. Отримуємо розмір файлу
        file_size_bytes = os.path.getsize(file_path)

        # 5. Розрахунки по сигналу (NumPy)
        # Важливо: приводимо до моно для розрахунку амплітуд
        if num_channels > 1:
            mono_signal = np.mean(signal, axis=1) # Усереднюємо канали
        else:
            mono_signal = signal
            
        # Беремо абсолютні (модуль) значення для амплітуд
        abs_signal = np.abs(mono_signal)
        
        # Конвертуємо з numpy-типів у звичайні float (важливо для JSON!)
        max_amplitude = float(np.max(abs_signal))
        avg_amplitude = float(np.mean(abs_signal))

        # 6. Формуємо результат (округлюємо для компактності)
        result = {
            "sampling_rate": sampling_rate,
            "num_channels": num_channels,
            "bit_depth": bit_depth,
            "signal_length_seconds": round(signal_length_seconds, 3), # Округлення
            "num_samples": num_samples,
            "file_size_bytes": file_size_bytes,
            "max_amplitude": round(max_amplitude, 5), # Округлення
            "avg_amplitude": round(avg_amplitude, 5)  # Округлення
        }
        
        return result

    except Exception as e:
        print(f"Error in get_characteristics: {e}", file=sys.stderr)
        return {} # Повертаємо порожній, щоб тест гарантовано впав


def get_waveform(file_path, max_points=5000):
    """
    Завантажує сигнал і повертає дані для осцилограми (з децимацією та округленням).
    """
    try:
        info = sf.info(file_path) # Завантажуємо info для тривалості
        signal, samplerate = sf.read(file_path, dtype='float32')

        # 1. Приводимо до МОНО (якщо стерео)
        if signal.ndim > 1:
            mono_signal = np.mean(signal, axis=1)
        else:
            mono_signal = signal

        num_samples_original = len(mono_signal)

        # 2. Децимація (Проріджування)
        if num_samples_original > max_points:
            step = num_samples_original // max_points
            mono_signal = mono_signal[::step] # Проріджуємо сигнал

        # Оновлена кількість точок після проріджування
        num_points_final = len(mono_signal)

        # 3. Створюємо вісь часу
        # Загальна тривалість файлу
        total_duration_seconds = float(info.frames) / info.samplerate
        
        # Створюємо коректну вісь часу для num_points_final точок
        time_axis = np.linspace(0, total_duration_seconds, num_points_final)

        time_axis = np.round(time_axis, 4) # Округлення осі часу
        mono_signal = np.round(mono_signal, 5) # Округлення амплітуди

        # 4. Повертаємо JSON-friendly списки
        return {
            "time": time_axis.tolist(),
            "amplitude": mono_signal.tolist()
        }

    except Exception as e:
        print(f"Error in get_waveform: {e}", file=sys.stderr)
        return {"time": [], "amplitude": []}
