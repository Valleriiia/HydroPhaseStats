import sys
import json
import traceback

# --- 1. Імпортуємо ВСЕ, що ми написали ---
from processing.loader import get_characteristics, get_waveform
from processing.spectra import get_spectra, get_phasegram
from processing.stats import get_statistics, get_phase_histograms

def main():
    try:
        # --- 2. Отримуємо шлях до файлу (як і раніше) ---
        if len(sys.argv) < 2:
            raise ValueError("Помилка: Не вказано шлях до аудіофайлу.")
        
        file_path = sys.argv[1]

        # --- 3. Викликаємо всі наші протестовані функції ---
        # Кожна функція читає файл і повертає свою частину JSON
        
        # Функції з loader.py
        characteristics_data = get_characteristics(file_path) # Повертає {"sampling_rate":...}
        waveform_data = get_waveform(file_path)             # Повертає {"time":...}
        
        # Функції з spectra.py
        spectra_data = get_spectra(file_path)           # Повертає {"amplitude_spectrum":...}
        phasegram_data = get_phasegram(file_path)         # Повертає {"phasegram":...}
        
        # Функції з stats.py
        stats_data = get_statistics(file_path)            # Повертає {"statistics":...}
        histograms_data = get_phase_histograms(file_path) # Повертає {"phase_histogram":...}


        # --- 4. Збираємо фінальний JSON-контракт ---
        
        final_result = {
            # Вкладаємо дані з loader.py
            "characteristics": characteristics_data,
            "waveform": waveform_data,
            **spectra_data,    # Додає 'amplitude_spectrum' та 'phase_spectrum'
            **phasegram_data,  # Додає 'phasegram'
            **stats_data,      # Додає 'statistics'
            **histograms_data  # Додає 'phase_histogram' та 'phase_rose_plot'
        }
        
        # --- 5. Повертаємо ---
        print(json.dumps(final_result, ensure_ascii=False, separators=(',', ':')))
        
        sys.exit(0) 

    except Exception as e:
        print(f"PythonError: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
