// frontend/assets/js/script.js

// 1. Отримуємо елементи
const uploadBtn = document.getElementById('upload'); // Кнопка вибору/завантаження
const fileInput = document.getElementById('fileInput');
// Тобі, ймовірно, знадобиться ще одна кнопку для запуску "Аналізу", 
// або робити це автоматично після вибору файлу.

// Функція для відправки файлу
async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
        // 1. Завантажуємо файл
        console.log("Uploading...");
        const uploadRes = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadData.error);
        
        const fileName = uploadData.fileName;
        console.log("Uploaded:", fileName);

        // 2. Запускаємо аналіз
        console.log("Analyzing...");
        const analysisRes = await fetch('http://localhost:3000/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: fileName })
        });
        const analysisData = await analysisRes.json();

        if (!analysisRes.ok) throw new Error(analysisData.error);

        // 3. Тут треба відобразити дані (analysisData.data) на сторінці
        console.log("Results:", analysisData.data);
        updateUI(analysisData.data);

    } catch (error) {
        console.error("Error:", error);
        alert("Сталася помилка: " + error.message);
    }
}

// Додай слухач на зміну файлу, щоб зразу запускати процес (або додай кнопку "Start")
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    document.getElementById('fileName').textContent = file.name;
    handleFileUpload(file); // <-- Викликаємо функцію
  }
});

function updateUI(data) {
    // Приклад заповнення полів:
    document.getElementById('samplingRate').textContent = data.characteristics.sampling_rate;
    document.getElementById('meanPhase').textContent = data.statistics.mean_phase;
    // ... тут треба код для малювання графіків (Chart.js або інше)
}