$(document).ready(function() {
    var full_name = $("#full_name");
    var email = $("#email");
    var phone_number = $("#phone_number");

    var emailPattern = /^((?:[A-Za-z0-9!#$%&'*+\-\/=?^_`{|}~]|(?<=^|\.)"|"(?=$|\.|@)|(?<=".*)[ .](?=.*")|(?<!\.)\.){1,64})(@)((?:[A-Za-z0-9.\-])*(?:[A-Za-z0-9])\.(?:[A-Za-z0-9]){2,})$/;
    var namePattern = /^[A-Za-z ]+$/;
    var phonePattern = /^\+?[0-9]\d{1,14}$/;

    
    // sets border to red
    function setError(element, errorElement, message) {
        element.css("border-color", "var(--cancel)");
        element.css("border-width", "2px");
        errorElement.text(message).css("display", "block");
    }

    function setDefault(element, errorElement,) {
        element.css("border-color", "var(--text-color)");
        element.css("border-width", "1px");
        errorElement.css("display", "none");
        
    }

    function validate() {
        // check if description is empty 
        var isValid = true;

        if (full_name.val() == "" || !namePattern.test(full_name.val())) {
            setError(full_name, $("#full_name_error"), "Please provide a valid full name.");
            isValid = false;
        } else {
            setDefault(full_name, $("#full_name_error"));
        }

        if (email.val() == "" || !emailPattern.test(email.val())) {
            setError(email, $("#email_error"), "Please provide a valid email address.");
            isValid = false;
        } else {
            setDefault(email, $("#email_error"));
        }

        if (phone_number.val() == "" || !phonePattern.test(phone_number.val())) {
            setError(phone_number, $("#phone_error"), "Please provide a valid phone number.");
            isValid = false;
        } else {
            setDefault(phone_number, $("#phone_error"));
        }

        return isValid;
    }
    
    $("#confirmbtn").click(function() {
        if(validate()) {
            var edits = {
                full_name: full_name.val(),
                email: email.val(),
                phone_number: phone_number.val(),
                id: $("#confirmbtn").val()
            }

            $.post("/edit/confirm-user", edits, function (response) {
                if (response.redirect) {
                    window.location.href = response.redirect;
                }
                else {
                    $('body').html(response)
                }
            });
        }     

    })

});
