(function() {
    // 1
    // Get data and do the page rendering
    function renderReportsOnPage(params) {
        getReports(params).pipe(function(reportlist, offset, moreResults) {

            // set state of 'Prev' button
            var prev = $.ap(t.btnPrev);
            if (offset == 0) {
                prev.button('disable');
            } else {
                prev.button('enable');
            }

            // set state of 'Next' button
            var next = $.ap(t.btnNext)
            if(!moreResults) {
                next.button('disable');
            } else {
                next.button('enable');
            }

            var anchor = $.ap(t.lstComp);
            var html = getReportListHTML(reportlist);
            anchor.html(html);

            // set ratings
            $.each(reportlist, function(key, val) {
                var averageRating = val.averageRating || 0;
                $.ap('#rating-' + val.id).raty({
                    readOnly: true,
                    start: averageRating,
                    half: true
                });
            });
            // refresh JQM listview
            if(App.animations) {
                anchor.listview('refresh').fadeIn();
            } else {
                anchor.listview('refresh').show();
            }
        });
    }

    // 2
    // Fetch reports list and return promise with reportlist
    function getReports(params) {
        var dfd = $.Deferred();
        $.ajax({
            url: App.RESOURCE_REPORTS,
            cache: false,
            data: $.extend({
                order_by : '-creationTime'
            }, params)
        })
        .success(function(data) {
            var numResults = parseInt(data.meta.limit);
            var offset = parseInt(data.meta.offset);
            var total = parseInt(data.meta.total_count);
            var moreResults = true;

            if((offset+numResults) >= total) {
                moreResults = false;
            }

            var reportlist = [].concat(data.objects);
            dfd.resolve(reportlist, offset, moreResults);
        })
        .fail(function() {
            dfd.resolve(null, null, false);
        });
        return dfd.promise();
    }

    // 3
    // Render HTML using reportlist and photos
    function getReportListHTML(reportlist) {
        // template to render a single list entry
        var compiled = _.template('<li><a href="detail?cid=<%= id %>">'
                +'<img src="<%- photo %>" class="report" />'
                +'<h3><%- title %></h3><p><%- description %></p>'
                +'<div id="rating-<%= id %>"></div></a></li>');

        var html = '';
        // instantiate list items and chain them together
        $.each(reportlist, function(key, val) {
            var first_photo = val.photos[0] || {};
            html += compiled({
                id: val.id,
                title: (val.title || "No title"),
                photo: (first_photo.photo || App.IMAGE_MISSING),
                description: (val.description || "No description")
            });
        });
        return html;
    }

    // get the URL to the next/previous page
    function getPaginationUrl(params, relOffset) {
        var offset = parseInt(params['offset']) || 0;
        offset += relOffset;
        params['offset'] = (offset < 0) ? 0 : offset;
        params['limit'] = Math.abs(relOffset);

        return "./list?" + $.param(params);
    }

    // store everything
    var t = {
        btns:  '#buttons',
        btnNext: '#pageNext',
        btnPrev: '#pagePrev',
        lstComp: '#reportsList',
        limit: 2 // number of items to display
    };


    // PAGEBEFORESHOW
    $('#reportsview').live('pagebeforeshow', function() {
        var key;
        console.log("=== pagebeforeshow for #reportsview");

        // recalculate number of items to display
        t.limit = Math.floor((window.innerHeight-160) / 100);
        // display at least two items
        t.limit = t.limit > 2 ? t.limit : 2;

        // fetch params from URL
        t.params = App.parseUri();
        // remove empty params
        for (key in t.params) {
            if (t.params.hasOwnProperty(key) && t.params[key] === '') {
                delete t.params[key];
            }
        }

        // magic for pagination
        t.params['offset'] = t.params['offset'] || 0
        t.params['limit'] = t.limit;

        // set page caption
        $.ap('#title').text(t.params['_heading'] || "Reports List");

        // next page button handler
        $.ap(t.btnNext).unbind('click').click(function() {
            $.mobile.changePage(getPaginationUrl(t.params, t.limit), {
                transition: 'none',
                allowSamePageTransition: true
            });
        });

        // prev page button handler
        $.ap(t.btnPrev).unbind('click').click(function() {
            $.mobile.changePage(getPaginationUrl(t.params, -t.limit), {
                transition: 'none',
                allowSamePageTransition: true
            });
        });

        // fetch reports and add to DOM
        renderReportsOnPage(t.params);
    });
}).call(this);
