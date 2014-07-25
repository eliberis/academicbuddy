jQuery(document).ready(function() {
    $('input').change(function(obj) {
        var label = $(obj.target.labels[0]);
        label.toggleClass("active"); //jQuery triggers event first, then updates state...
        var url = Routing.generate('user_data');
        var data = {
            mentors    : $("#mentors").is(".active"),
            pupils     : $("#pupils").is(".active"),
            enabled    : $("#enabled").is(".active"),
            notenabled : $("#notenabled").is(".active")
        };
        label.toggleClass("active");
        $.get(url, data).done(function(resp) {
            $("#list").html(resp);
        });
    });
    $('#mentors').click();
    $('#enabled').click();
});
