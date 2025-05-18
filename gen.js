const qrText = document.getElementById('qr-text');
const generateBtn = document.getElementById('generate-btn');
const qrcode = document.getElementById('qrcode');
const qrDownload = document.getElementById('qr-download');

generateBtn.addEventListener('click', generateQRCode);

qrText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});

function generateQRCode() {
    const text = qrText.value.trim();

    if (!text) {
        qrcode.innerHTML = '<p class="error">Please enter some text or URL</p>';
        qrDownload.style.display = 'none';
        return;
    }

    qrcode.innerHTML = '';

    new QRCode(qrcode, {
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const qrImg = qrcode.querySelector('img');
        if (qrImg) {
            qrDownload.href = qrImg.src;
            qrDownload.style.display = 'inline-block';
        }
    }, 100);
}