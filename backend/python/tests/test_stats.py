import pytest
from processing.stats import get_statistics, get_phase_histograms

TEST_FILE = "sample_data/whale_noice.wav"

def test_get_statistics_returns_correct_structure():
    """
    Перевіряє, що функція повертає коректний набір
    статистичних метрик (п. 9 ТЗ).
    """
    data = get_statistics(TEST_FILE)
    
    # 1. Перевіряємо, що це словник
    assert isinstance(data, dict)
    
    # 2. Перевіряємо наявність ключа "statistics"
    assert "statistics" in data
    
    stats = data["statistics"]
    assert isinstance(stats, dict)
    
    # 3. Перевіряємо всі ключі з ТЗ
    required_keys = [
        "mean_phase",
        "phase_variance",
        "coherence", # (може бути None)
        "phase_entropy",
        "circular_mean",
        "circular_variance",
        "amplitude_weighted_average",
        "phase_transition_count"
    ]
    
    for key in required_keys:
        assert key in stats
        
    # 4. Перевіряємо, що значення - це числа (або None)
    for key in required_keys:
        assert isinstance(stats[key], (int, float, type(None)))

def test_get_phase_histograms_returns_correct_structure():
    """
    Перевіряє, що функція повертає коректну структуру
    для гістограми та rose plot (п. 7 і 8 ТЗ).
    """
    data = get_phase_histograms(TEST_FILE)
    
    # 1. Перевіряємо ключі
    assert "phase_histogram" in data
    assert "phase_rose_plot" in data
    
    # 2. Перевіряємо гістограму
    hist = data["phase_histogram"]
    assert "bins" in hist
    assert "counts" in hist
    assert isinstance(hist["bins"], list)
    assert isinstance(hist["counts"], list)
    
    # 3. Перевіряємо rose plot
    rose = data["phase_rose_plot"]
    assert "angles" in rose
    assert "magnitudes" in rose
    assert isinstance(rose["angles"], list)
    assert isinstance(rose["magnitudes"], list)
    
    # 4. Переконуємось, що вони мають дані
    assert len(hist["counts"]) > 0
    assert len(rose["magnitudes"]) > 0
