$(document).ready(function() {

    $('#editbtn').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

    $('#deletebtn').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

    function numberWithCommas(number) {
        // regex formula from
        // https://www.delftstack.com/howto/javascript/javascript-add-commas-to-number/
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // format amount to add commas 
    var unformattedAmount = parseFloat($("#amount").text());

    $("#amount").text(numberWithCommas("P " + unformattedAmount.toFixed(2)));

});