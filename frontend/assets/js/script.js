const uploadBtn = document.getElementById('upload');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
  } else {
    fileNameDisplay.textContent = 'No file selected';
  }
});
