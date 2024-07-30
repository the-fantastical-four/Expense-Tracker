$(document).ready(function() {

    $('.entry').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

    $('.accountContainer').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

});