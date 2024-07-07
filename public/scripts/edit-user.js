$(document).ready(function() {
    var full_name = $("#full_name");
    var email = $("#email");
    var phone_number = $("#phone_number"); // not required

    // sets border to red
    function setError(element) {
        element.css("border-color", "var(--cancel)");
        element.css("border-width", "2px")
    }

    function setDefault(element) {
        element.css("border-color", "var(--text-color)");
        element.css("border-width", "1px")
    }

    function validate() {
        // check if description is empty 
        var isValid = true;

        // check full name
        if (full_name.val() == "") {
            setError(full_name);
            isValid = false;
        }
        else {
            setDefault(full_name);
        }

        // check email
        if (email.val() == "") {
            setError(email)
            isValid = false;
        }
        else {
            setDefault(email);
        }

        if (phone_number.val() == "") {
            setError(phone_number)
            isValid = false;
        }
        else {
            setDefault(phone_number);
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

            $.post("/edit/confirm-user", edits, function (data, status) {
                console.log(data);
            });

            setTimeout(function() {
                var back = "/view/user?id=" + $("#confirmbtn").val();
                window.location.href = back;
            }, 500);
            //window.open(back, "_self");
        }

    })

});