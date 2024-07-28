$(document).ready(function() {

    $('.entry').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

    $('.accountContainer').on('click', function () {
        const href = $(this).data('href');
        window.location.href = href;
    });

    // BELOW IS USELESS CODE 


    // format numbers to have commas 
    function numberWithCommas(number) {
        // regex formula from
        // https://www.delftstack.com/howto/javascript/javascript-add-commas-to-number/
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var totalExpense = 0;
    var totalIncome = 0;
    var totalSavings = 0; 

    // get balance 
    $.get('get-total', function(data, status) {

        data.forEach((item, i) => {

            if(item.entryType == "expense")
                totalExpense += item.amount;
            else if(item.entryType == "income")
                totalIncome += item.amount; 
            else if(item.entryType == "savings")
                totalSavings += item.amount; 
        });

        var totalBalance = totalIncome - totalExpense; 

        // to .toFixed(2) adds decimal 
        $("#totalExpenses").text("P" + numberWithCommas(totalExpense.toFixed(2)));
        $("#totalIncome").text("P" + numberWithCommas(totalIncome.toFixed(2)));
        $("#totalSavings").text("P" + numberWithCommas(totalSavings.toFixed(2)))
        $("#balamount").text("P" + numberWithCommas(totalBalance.toFixed(2)));

        // box containing the budget goal will turn red if expenses exceed budget 
        // and box containing savings goal will turn green if goal is reached 
        $.get('get-goals', function(data, status) {
            var budgetGoal = data.budgetGoal;
            var savingsGoal = data.savingsGoal; 

            if(totalExpense > budgetGoal) {
                $("#budget").css("border-top-color", "var(--cancel)");
                $("#budget-msg").text("Budget exceeded")
            }
            else {
                $("#budget").css("border-top-color", "var(--box-color)");
                $("#budget-msg").text("");
            }

            if (totalSavings >= savingsGoal) {
                $("#savingsgoal").css("border-top-color", "var(--good)");
                $("#savings-msg").text("Savings goal reached!")
            }
            else {
                $("#savingsgoal").css("border-top-color", "var(--box-color)");
                $("#savings-msg").text("")
            }
        }); 
    });

    // search 
    $("#search").keydown(function (event) {
        if (event.keyCode === 13) {
            var input = $("#search").val();
            window.open("/search?key=" + input, "_self"); 
        }
    });
   
    // edit budget goal
    $("#editbudget").click(function() {
        $.get("edit-budget", function (data, status) {
            var amount = data.budgetGoal;
            $("#budgetamount").html("<input id='newbudget' type='number' value='"
                + amount + "'>"); // append input elemeent 

            // make edit button invisible 
            $("#editbudget").hide();

            // create done button element
            var confirmBtn = document.createElement("a");
            $(confirmBtn).text("done");
            $(confirmBtn).addClass("edit");
            $(confirmBtn).attr("id", "confirmbudget");
            $("#budget").append(confirmBtn);

            $("#confirmbudget").click(function() {
                var newBudget = $("#newbudget").val();
                var doc = {budgetGoal: newBudget};

                $.get("edit-budget/confirm", doc, function(data, status) {
                    console.log("Making an edit...");
                });

                // if new budget is lesser than total expenses, box turns red 
                if (totalExpense > newBudget) {
                    $("#budget").css("border-top-color", "var(--cancel)");
                    $("#budget-msg").text("Budget exceeded")
                }
                else {
                    $("#budget").css("border-top-color", "var(--box-color)");
                    $("#budget-msg").text("");
                }

                // show edits in page 
                $("#budgetamount").html("P" + numberWithCommas(Number(newBudget).toFixed(2)));
                $("#newbudget").remove(); // remove input element
                $("#confirmbudget").remove(); // remove done button 

                // unhide edit button 
                $("#editbudget").show();
                
            });
        });
    });

    // edit budget goal
    $("#editsavgoal").click(function () {
        $.get("edit-savings", function (data, status) {
            var amount = data.savingsGoal;
            $("#sgoalamount").html("<input id='newsavings' type='number' value='"
                + amount + "'>"); // append input elemeent 

            // make edit button invisible 
            $("#editsavgoal").hide();

            // create done button element
            var confirmBtn = document.createElement("a");
            $(confirmBtn).text("done");
            $(confirmBtn).addClass("edit");
            $(confirmBtn).attr("id", "confirmsavings");
            $("#savingsgoal").append(confirmBtn);

            $("#confirmsavings").click(function () {
                var newSavings = $("#newsavings").val();
                var doc = { savingsGoal: newSavings };

                $.get("edit-savings/confirm", doc, function (data, status) {
                    console.log("Making an edit...");
                });

                // if savings goal is reached or exceeded, box turns green
                if (totalSavings >= newSavings) {
                    $("#savingsgoal").css("border-top-color", "var(--good)");
                    $("#savings-msg").text("Savings goal reached!")
                }
                else {
                    $("#savingsgoal").css("border-top-color", "var(--box-color)");
                    $("#savings-msg").text("")
                }

                // show edits in page 
                $("#sgoalamount").html("P" + numberWithCommas(Number(newSavings).toFixed(2)));
                $("#newsavings").remove(); // remove input element
                $("#confirmsavings").remove(); // remove done button 

                // unhide edit button 
                $("#editsavgoal").show();

            });
        });
    });

});