(function() {
    // PAGEBEFORESHOW
    $('#settings').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #settings");

        if (typeof App.username !== "undefined" && App.username !== null) {
          var text = "You're currently logged in as <strong>";
          text += App.username + '</strong>.';

          $('#name_paragraph_settings').html(text).show();
        } else {
          $('#name_paragraph_settings').hide();
        }
    });
}).call(this);
