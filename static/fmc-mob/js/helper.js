if(typeof App === 'undefined' || App === null) {
    (function() {
        console.log('=== Initializing helper class');

        App = {};
        App.animations = false;

        // Resources & Default URLs
        App.RESOURCE_REPORTS = '/fmc-api/cm/reports/';
        App.RESOURCE_CATEGORIES = '/fmc-api/cm/categories/';
        App.RESOURCE_STATUSES   = '/fmc-api/cm/statuses/';
        App.RESOURCE_CROSSPOST  = '/fmc-mob/crosspost';
        App.IMAGE_MISSING       = '/static/fmc-mob/img/nophoto.png';

        // query string to object parser
        // if 'param' is provided, only a single value is returned
        App.parseUri = function(param) {

            // hack, because sometimes we receive an intermediate url
            // with a hash here
            var qstr = $.mobile.path.parseUrl(location.href).hash.substring(1);
            qstr = $.mobile.path.parseUrl(qstr).search;
            if(qstr.length <= 1) { // this should be the normal route
                qstr = $.mobile.path.parseUrl(location.href).search;
            }

            if(qstr.length > 1) {
                var a = qstr.substring(1).split('&')
                  , b = {};
                if(a == "") {
                    return {};
                }
                for(var i = 0; i < a.length; ++i) {
                    var p = a[i].split('=');
                    if(p.length != 2) {
                        continue;
                    }
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                }

                return b[param] || b;
            } else {
                return {};
            }
        };

        App.staticMap = function(latLng, zoom, width, height) {
            var url = 'http://maps.googleapis.com/maps/api/staticmap?sensor=false&maptype=roadmap';
            url += '&markers=color:blue|' + latLng.latitude + ',' + latLng.longitude;
            url += '&format=jpg&zoom=' + zoom;
            url += '&scale=1&size=' + Math.round(width) + 'x' + Math.round(height);
            return url;
        }

        $.ajaxSetup({
            dataType: 'json',
            cache: true
            //timeout: 10000,
            //beforeSend: function() {
            //    $.mobile.showPageLoadingMsg();
            //},
            //complete: function() {
            //    $.mobile.hidePageLoadingMsg();
            //}
        });

        // random bit to make page-decaching work
        $('div').live('pagehide', function(event, ui){
            var page = jQuery(event.target);

            if(page.attr('force-flush') == 'true'){
                console.log("=== Removing page from DOM");
                page.remove();
            };
        });

        // HACK: removes the search string from data.toPage
        // makes jQuery recognize that the page is already loaded
        $(document).bind('pagebeforechange', function(e, data) {
            if(typeof data.toPage === "string") {
                var u = $.mobile.path.parseUrl(data.toPage);
                if(u.search) {
                    if(!data.options.dataUrl) {
                        data.options.dataUrl = data.toPage;
                    }
                    data.toPage = u.hrefNoSearch;
                }
            }
        });

        // jQuery mobile micro-plugin that selects items on active page
        (function($) {
            $.ap = function(selector) {
                return $.mobile.activePage.find(selector);
            }
        })(jQuery);
    }).call(this);
} else {
    console.log("=== Not initializing helper class");
}
