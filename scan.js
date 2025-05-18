document.addEventListener('DOMContentLoaded', function () {
    const fileUpload = document.getElementById('file-upload');
    const preview = document.getElementById('preview');
    const resultContainer = document.getElementById('result-container');
    const scanResult = document.getElementById('scan-result');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');
    const uploadArea = document.querySelector('.upload-area');

    if (!fileUpload || !uploadArea || !copyBtn || !preview || !resultContainer || !scanResult || !resultLink) {
        console.error('Required DOM elements are missing');
        return;
    }

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#6e8efb';
        uploadArea.style.backgroundColor = '#f9f9ff';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        resultContainer.style.display = 'none';

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
                try {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    context.drawImage(img, 0, 0, img.width, img.height);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth'
                    });

                    if (code && code.data) {
                        displayResult(code.data);
                    } else {
                        displayError('No QR code found in the image. Please ensure the QR code is clear and try again.');
                    }
                } catch (error) {
                    console.error('Error processing QR code:', error);
                    displayError('Error processing image. Please try a different image.');
                }
            };

            img.onerror = () => {
                displayError('Failed to load image. Please try again.');
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            displayError('Failed to read the file. Please try again.');
        };

        reader.readAsDataURL(file);

        fileUpload.value = '';
    }

    function displayResult(data) {
        resultContainer.style.display = 'block';
        scanResult.textContent = data;

        if (isValidURL(data)) {
            let url = data;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            resultLink.href = url;
            resultLink.style.display = 'inline-block';
            resultLink.textContent = 'Open Link';
        } else {
            resultLink.style.display = 'none';
        }
    }

    function displayError(message) {
        resultContainer.style.display = 'block';
        scanResult.innerHTML = `<span class="error">${message}</span>`;
        resultLink.style.display = 'none';
    }

    function isValidURL(string) {
        const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        return urlPattern.test(string);
    }

    copyBtn.addEventListener('click', () => {
        const text = scanResult.textContent;

        if (!text || text.includes('error')) {
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy text. Please try again.');
            });
    });
});
