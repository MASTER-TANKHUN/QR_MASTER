const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`${tabId}-panel`).classList.add('active');
    });
});

const fileUpload = document.getElementById('file-upload');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('preview-container');
const resultContainer = document.getElementById('result-container');
const scanResult = document.getElementById('scan-result');
const resultLink = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const uploadArea = document.querySelector('.upload-area');

uploadArea.addEventListener('click', () => {
    fileUpload.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#6e8efb';
    uploadArea.style.backgroundColor = '#f9f9ff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = 'transparent';

    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.match('image.*')) {
    alert('Please select an image file.');
    return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                displayResult(code.data);
            } else {
                displayError("No QR code found in the image.");
            }
        };

    img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function displayResult(data) {
    scanResult.textContent = data;
    resultContainer.style.display = 'block';

    if (isValidURL(data)) {
        resultLink.href = data;
        resultLink.style.display = 'inline-block';
        resultLink.textContent = 'Open Link';
    } else {
        resultLink.style.display = 'none';
    }
}

function displayError(message) {
    scanResult.innerHTML = `<span class="error">${message}</span>`;
    resultContainer.style.display = 'block';
    resultLink.style.display = 'none';
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

copyBtn.addEventListener('click', () => {
    const text = scanResult.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});