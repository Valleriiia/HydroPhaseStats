import sys
import json
import traceback
import io
import contextlib

from processing.loader import get_characteristics, get_waveform
from processing.spectra import get_spectra, get_phasegram
from processing.stats import get_statistics, get_phase_histograms


def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("Не вказано шлях до аудіофайлу")

        file_path = sys.argv[1]

        # --- Глушимо весь зайвий stdout із внутрішніх функцій ---
        silent_stdout = io.StringIO()
        with contextlib.redirect_stdout(silent_stdout):

            characteristics_data = get_characteristics(file_path)
            waveform_data = get_waveform(file_path)
            spectra_data = get_spectra(file_path)
            phasegram_data = get_phasegram(file_path)
            stats_data = get_statistics(file_path)
            histograms_data = get_phase_histograms(file_path)

        # --- Формуємо контракт ---
        final_result = {
            "characteristics": characteristics_data,
            "waveform": waveform_data,
            **spectra_data,
            **phasegram_data,
            **stats_data,
            **histograms_data
        }

        # --- Повертаємо ЧИСТИЙ JSON ---
        sys.stdout.write(json.dumps(final_result, ensure_ascii=False))
        sys.exit(0)

    except Exception as e:
        # В stderr — можна
        print(f"PythonError: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
