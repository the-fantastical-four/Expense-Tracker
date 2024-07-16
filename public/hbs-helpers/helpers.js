function numberWithCommas(number) {
    // regex formula from
    // https://www.delftstack.com/howto/javascript/javascript-add-commas-to-number/
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    
    currency: function(value) {
        return "P" + numberWithCommas(Number(value).toFixed(2));
    },

    select: function(selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    },

    formatDate: function (timestamp) {
        return formatDate(timestamp);
    }
}