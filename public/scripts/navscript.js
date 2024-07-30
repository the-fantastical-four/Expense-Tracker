/* Set the width of the side navigation to 250px */
// function openNav() {
//     document.getElementById("menubar").style.width = "250px";
// }

// /* Set the width of the side navigation to 0 */
// function closeNav() {
//     document.getElementById("menubar").style.width = "0";
// }

// document.getElementById('menubutton').addEventListener('click', openNav);
// document.querySelector('.closebtn').addEventListener('click', closeNav);

$(document).ready(function () {

    function openNav() {
        document.getElementById("menubar").style.width = "250px";
    }

    /* Set the width of the side navigation to 0 */
    function closeNav() {
        document.getElementById("menubar").style.width = "0";
    }

    $('#menubutton').on('click', function () {
        openNav();
    });

    $('.closebtn').on('click', function () {
        closeNav();
    });

    $('.entry').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });
});