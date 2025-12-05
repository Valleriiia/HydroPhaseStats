import sys
import json
import traceback

# Імпорти
from processing.loader import get_characteristics, get_waveform
from processing.spectra import get_spectra, get_phasegram
from processing.stats import get_statistics, get_phase_histograms

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("Помилка: Не вказано шлях до аудіофайлу.")
        
        file_path = sys.argv[1]
        
        # Парсимо налаштування (якщо є)
        options = {}
        if len(sys.argv) > 2:
            try:
                options = json.loads(sys.argv[2])
            except:
                pass # Якщо JSON битий, використовуємо дефолтні
        
        # --- Викликаємо функції з передачею параметрів ---
        
        # Loader (Waveform + Normalization)
        norm_type = options.get('signalNormalization', 'nonormalization')
        characteristics_data = get_characteristics(file_path) 
        waveform_data = get_waveform(file_path, normalization=norm_type)
        
        # Spectra (FFT Window + STFT params)
        fft_window = options.get('fftWindow', 'hamming')
        
        stft_option = options.get('stftWindow', '256points')
        nperseg = 256
        if stft_option == '512points': nperseg = 512
        elif stft_option == '1024points': nperseg = 1024
        
        spectra_data = get_spectra(file_path, window_type=fft_window)
        phasegram_data = get_phasegram(file_path, window_type=fft_window, nperseg=nperseg)
        
        # Stats
        stats_data = get_statistics(file_path)
        histograms_data = get_phase_histograms(file_path)

        # Збираємо результат
        final_result = {
            "characteristics": characteristics_data,
            "waveform": waveform_data,
            **spectra_data,
            **phasegram_data,
            **stats_data,
            **histograms_data
        }
        
        print(json.dumps(final_result, ensure_ascii=False, separators=(',', ':')))
        sys.exit(0) 

    except Exception as e:
        print(f"PythonError: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()