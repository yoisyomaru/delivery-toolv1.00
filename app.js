const themeToggle = document.getElementById('themeToggle');
const app = document.getElementById('app');

// Load theme from LocalStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    app.classList.toggle('dark-mode', currentTheme === 'dark');
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const isDark = app.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// サイズ換算機能
const sizeInput = document.getElementById('sizeInput');
const sizeOutput = document.getElementById('sizeOutput');

sizeInput.addEventListener('input', () => {
    const size = parseInt(sizeInput.value);
    if (!isNaN(size)) {
        sizeOutput.textContent = Math.round(size * (170 / size)); // 簡略化した換算
    } else {
        sizeOutput.textContent = 0;
    }
});

// 才数換算機能
const lengthInput = document.getElementById('lengthInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const volumeOutput = document.getElementById('volumeOutput');
const tasuOutput = document.getElementById('tasuOutput');

[lengthInput, widthInput, heightInput].forEach(input => {
    input.addEventListener('input', () => {
        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;

        const volume = length * width * height;
        volumeOutput.textContent = volume.toFixed(2);
        tasuOutput.textContent = (volume / 28316).toFixed(2); // 才数換算
    });
});

// バーコード生成機能
const barcodeInput = document.getElementById('barcodeInput');
const barcodeDisplay = document.getElementById('barcodeDisplay');

barcodeInput.addEventListener('input', () => {
    const value = barcodeInput.value;
    if (/^\d*$/.test(value)) { //