$(document).ready(function() {
    // input stuff
    var date = $("#date");
    var description = $("#description");
    var ORnum = $("#ORnumber"); // not required
    var category = $("#category");
    var amount = $("#amount");
    var type = $("#entrytype");
    var notes = $("#notes"); // not required

    // sets border to red
    function setError(element) {
        element.css("border-color", "var(--cancel)");
        element.css("border-width", "2px")
    }

    // sets border to black
    function setDefault(element) {
        element.css("border-color", "var(--text-color)");
        element.css("border-width", "1px")
    }

    function validate() {
        // check if description is empty 
        var isValid = true;

        // check description
        if (description.val() == "") {
            setError(description);
            isValid = false;
        }
        else {
            setDefault(description);
        }

        // check category
        if (category.val() == "") {
            setError(category)
            isValid = false;
        }
        else {
            setDefault(category);
        }

        // check amount 
        if (amount.val() == "") {
            setError(amount);
            isValid = false;
        }
        else {
            setDefault(amount);
        }
        // check entry type 
        if (type.val() == "NA") {
            setError(type);
            isValid = false;
        }
        else {
            setDefault(type);
        }

        return isValid;
    }

    function getQueryParam(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    $("#confirmbtn").click(function() {
        if (validate()) {

            var queryId = getQueryParam('id');

            var edits = {
                entryType: type.find(":selected").val(),
                date: date.val(),
                category: category.val(),
                description: description.val(),
                amount: amount.val(),
                notes: notes.val(),
                id: queryId
            }

            $.post("/edit/confirm", edits, function (response) {
                if (response.redirect) {
                    window.location.href = response.redirect;
                }
            });
        }

    })

});