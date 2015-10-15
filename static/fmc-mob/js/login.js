(function() {
    // PAGEINIT
    $('#login').live('pageinit', function() {
        $(this).find('form').submit(function(e) {
            e.preventDefault();
            $(this).find('input[type=submit]').button('disable');
            App.username = $.trim($(this).find('input#id_username').val());

            $.mobile.changePage($(this).attr('action'), {
                type: 'post',
                transition: 'fade',
                reloadPage: 'true',
                data: $(this).serialize()
            });
            return false;
        });
    });

    // PAGEBEFORESHOW
    $('#login').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #login");

        $.ap('input[type=submit]').button('enable');
    });

    // PAGESHOW
    $('#login').live('pageshow', function() {
        console.log("=== pageshow for #login");

        // Remove all other pages. Aggressive de-caching.
        $('div[data-role="page"]').each(function(key, page) {
            if(page.id !== 'login'){
                $(page).remove();
                console.log("=== Page "+page.id+" removed from DOM!");
            };
        });
    });
}).call(this);
