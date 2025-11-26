import pytest
import numpy as np
from processing.spectra import get_spectra, get_phasegram

TEST_FILE = "sample_data/whale_noice.wav"

def test_get_spectra_returns_correct_structure():
    """
    Перевіряє, що функція повертає коректну структуру
    для амплітудного та фазового спектрів.
    """
    data = get_spectra(TEST_FILE)
    
    # 1. Перевіряємо, що це словник
    assert isinstance(data, dict)
    
    # 2. Перевіряємо ключі з ТЗ
    assert "amplitude_spectrum" in data
    assert "phase_spectrum" in data
    
    # 3. Перевіряємо амплітудний спектр
    amp_spec = data["amplitude_spectrum"]
    assert isinstance(amp_spec, dict)
    assert "frequency" in amp_spec
    assert "magnitude" in amp_spec
    assert isinstance(amp_spec["frequency"], list)
    assert isinstance(amp_spec["magnitude"], list)
    
    # 4. Перевіряємо фазовий спектр
    phase_spec = data["phase_spectrum"]
    assert isinstance(phase_spec, dict)
    assert "frequency" in phase_spec
    assert "phase" in phase_spec
    assert isinstance(phase_spec["frequency"], list)
    assert isinstance(phase_spec["phase"], list)
    
    # 5. Переконуємось, що масиви частот однакові
    assert amp_spec["frequency"] == phase_spec["frequency"]

def test_get_phasegram_returns_correct_structure():
    """
    Перевіряє, що функція повертає коректну структуру
    для фазограми (STFT).
    """
    data = get_phasegram(TEST_FILE)
    
    # 1. Перевіряємо, що це словник
    assert isinstance(data, dict)
    
    # 2. Перевіряємо наявність ключа "phasegram"
    assert "phasegram" in data
    
    # 3. Перевіряємо внутрішню структуру
    pg = data["phasegram"]
    assert isinstance(pg, dict)
    assert "time_axis" in pg
    assert "frequency_axis" in pg
    assert "phase_matrix" in pg
    
    # 4. Перевіряємо, що все - це списки (JSON-friendly)
    assert isinstance(pg["time_axis"], list)
    assert isinstance(pg["frequency_axis"], list)
    assert isinstance(pg["phase_matrix"], list)
    
    # 5. Перевіряємо, що матриця - це 2D список
    assert isinstance(pg["phase_matrix"][0], list)