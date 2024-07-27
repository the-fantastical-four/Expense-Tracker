$(document).ready(function() {

    // input stuff
    var date = $("#date");
    var description = $("#description");
    var ORnum = $("#ORnumber"); // not required
    var category = $("#category");
    var amount = $("#amount");
    var type = $("#entrytype");
    var notes = $("#notes"); // not required

    // set current date as default 
    var today = new Date();
    var formattedDate = today.getFullYear().toString() + '-'
        + (today.getMonth() + 1).toString().padStart(2, 0) + '-'
        + today.getDate().toString().padStart(2, 0);
    date.val(formattedDate);

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

    // validates if required fields have inputs 
    function validate() {
        // check if notes is empty 
        var isValid = true;

        if(description.val() == "") {
            setError(description);
            isValid = false;
        }
        else {
            setDefault(description);
        }

        // // check notes
        // if(notes.val() == "") {
        //     setError(notes);
        //     isValid = false;
        // }
        // else {
        //     setDefault(notes);
        // }

        // check category
        if(category.val() == "") {
            setError(category)
            isValid = false;
        }
        else {
            setDefault(category);
        }

        // check amount 
        if(amount.val() == "") {
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
        else if (type.val() !== "expense" && type.val() !== "income") {
            alert(type.val());
            setError(type);
            isValid = false;
        }
        else {
            setDefault(type);
        }

        return isValid; 
    }

    function sanitizeInput(input) {
        return input.replace(/<[^>]*?>/gi, '').replace(/[^\w\s]/gi, '');
    }

    function sanitizeAmount(input) {
        return input.replace(/<[^>]*?>/gi, '').replace(/[^\d.]/gi, ''); // Allow digits and dot for decimal values
    }

    $("#confirmbtn").click(function() {
        if(validate()) {

            var newEntry = {
                entryType: type.find(":selected").val(),
                date: date.val(),
                category: sanitizeInput(category.val()),
                description: sanitizeInput(description.val()),
                amount: sanitizeAmount(amount.val()),
                notes: sanitizeInput(notes.val())
            }

            $.post('add-entry', newEntry, function(response) {
                if (response.redirect) {
                    window.location.href = response.redirect;
                } else {
                    $('body').html(response);
                }
            })
        }
    });

    $("#cancelbtn").click(function() {
        window.open("/", "_self");
    });
});