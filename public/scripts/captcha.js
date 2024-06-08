document.addEventListener("DOMContentLoaded", function() {
    const captchaImage = document.getElementById('captchaImage');
    const refreshButton = document.getElementById('refreshCaptcha');

    refreshButton.addEventListener('click', function() {
        captchaImage.src = '/captcha?' + Date.now(); // Prevent caching
    });
});
