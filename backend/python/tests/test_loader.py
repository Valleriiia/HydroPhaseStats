import pytest
from processing.loader import get_characteristics, get_waveform
import numpy as np

TEST_FILE = "sample_data/whale_noice.wav"

def test_characteristics_runs_without_error():
    """
    Перший і найпростіший тест: 
    чи функція просто запускається, не падаючи?
    """
    data = get_characteristics(TEST_FILE)
    assert isinstance(data, dict)

def test_characteristics_has_required_keys():
    """
    Перевіряє, чи словник містить ВСІ
    обов'язкові ключі з ТЗ.
    """
    data = get_characteristics(TEST_FILE)

    required_keys = [
        "sampling_rate",
        "num_channels",
        "bit_depth",
        "signal_length_seconds",
        "num_samples",
        "file_size_bytes",
        "max_amplitude",
        "avg_amplitude"
    ]
    
    for key in required_keys:
        assert key in data

def test_get_waveform_returns_correct_structure():
    """
    Перевіряє, чи get_waveform повертає правильну структуру
    для осцилограми (time, amplitude).
    """
    data = get_waveform(TEST_FILE)
    
    # 1. Перевіряємо, що це словник
    assert isinstance(data, dict)
    
    # 2. Перевіряємо наявність ключів з ТЗ
    assert "time" in data
    assert "amplitude" in data
    
    # 3. Перевіряємо, що дані - це списки (JSON-friendly)
    assert isinstance(data["time"], list)
    assert isinstance(data["amplitude"], list)
    
    # 4. Перевіряємо, що списки не порожні
    assert len(data["time"]) > 0
    assert len(data["amplitude"]) > 0