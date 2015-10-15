(function() {
    function add_popup(div, username, message) {
        $(document).delegate(div, 'vclick', function(e) {
            $(this).simpledialog({
                'mode' : 'bool',
                'prompt' : 'Comment by ' + username,
                'subTitle': message,
                'useModal': false,
                'transition': null,
                'buttons' : {
                    'Close': {
                        click: function () {},
                        icon: 'close',
                        theme: 'a'
                    }
                }
            })
        })
    }

    function fetchComments(cid, div, offset) {
        var html = '<li data-role="list-divider">Comments <span class="ui-li-count">';
        $.ajax({
            url: App.RESOURCE_COMPLAINTS+cid+'/comments/',
            data: {limit: 10, offset: offset, order_by: '-creationTime'},
            cache: false,
            dataType: 'json'
        }).done(function(data) {
            html += data.meta.total_count + '</span></li>';

            var comment_tmpl = _.template('<li id="comment-<%= id %>"'
                +' class="comment-status-<%= sid %>">'
                + '<h3><%- uid %></h3><p><%- message %></p><p class="ui-li-aside">'
                +'<strong><%= time %></strong><br><%= day %>/<%= month %>'
                +'/<%= year %></p></li>');

            var patt = /(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}:\d{1,2}):\d{1,2}.*/
            $(data.objects).each(function(key, val) {
                var sid = 0;
                if(val.newStatus) {
                    sid = val.newStatus.id;
                }
                var pd = patt.exec(val.creationTime);
                html += comment_tmpl({
                    id: val.id,
                    sid: sid,
                    uid: val.user.username,
                    message: val.message,
                    time: pd[4],
                    day: pd[3],
                    month: pd[2],
                    year: pd[1]
                });
                add_popup('#comment-'+val.id, val.user.username, val.message);
            });
            $.ap(div).html(html).listview('refresh');
        });
    }

    function updateAvgRating(score) {
        $.ap('#avg_rating_detail').html('').raty({
            readOnly : true,
            start : score || 0.1,
            half : true,
            noRatedMsg : 'No ratings yet!',
            size : 24,
            starHalf : 'star-half-big.png',
            starOff : 'star-off-big.png',
            starOn : 'star-on-big.png'
        });
    }

    function doRating(cid, score) {
        $.post(App.RESOURCE_COMPLAINTS+cid+'/ratings/',
            { value : score })
        .success(function() {
            // lock own rating bar
            updateOwnRatingDisplay(score, true, cid);

            // get new average score
            $.ajax({
                url: App.RESOURCE_COMPLAINTS+cid+'/',
                cache: false,
                dataType: 'json'
            }).success(function(data) {
                updateAvgRating(data.averageRating);
            });
        });
    }

    // updates the own rating bar
    function updateOwnRatingDisplay(start, readOnly, cid) {
        $.ap('#my_rating_detail').html('');
        $.ap('#my_rating_detail').raty({
            click: function(score, evt) {
                doRating(cid, score);
            },
            start: start,
            //cancel: true,
            //cancelPlace: 'right',
            readOnly: readOnly,
            noRatedMsg: 'Not rated yet!',
            size: 24,
            //cancelOff: 'cancel-off-big.png',
            //cancelOn: 'cancel-on-big.png',
            starHalf: 'star-half-big.png',
            starOff: 'star-off-big.png',
            starOn: 'star-on-big.png',
            width: '100%'
        });
    }


    // CONSTANTS
    var FADE_IN_TIME = 1000,
        COMMENTS = '#comments_detail',
        COMMENT_FORM = '#comment_form_details',
        COMMENT_SUBMIT = '#comment_submit_detail';


    // PAGEBEFORESHOW
    $('#complaintdetails').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #complaintdetails");

        // get complaint ID from URL
        var complaint_id = App.parseUri('cid') || 1;

        // get data, fill page
        $.getJSON(App.RESOURCE_COMPLAINTS+complaint_id+'/', function(data) {
            var img_detail = $.ap('#image_detail');

            if(data.photos.length > 0) {
                var img = img_detail.attr('src', data.photos[0].photo)
            } else {
                var img = img_detail.attr('src', App.IMAGE_MISSING)
            }

            if(App.animations) {
                img.hide().unbind("load").bind("load", function() {$(this).fadeIn(FADE_IN_TIME)});
            } else {
                img.show();
            }

            // set average rating to score provided as argument
            $.ap('#title_detail').text((data.title || "No title"));
            $.ap('#textarea_detail').val(data.description || "No description");
            $.ap('#tags_detail').val(data.tags);
            $.ap('#category_detail').val(data.category.title);
            $.ap('#status_detail').val(data.status.title);
            $.ap('#countrycode_detail').val(data.address.country);
            $.ap('#city_detail').val(data.address.city);
            $.ap('#street_detail').val(data.address.street);
            $.ap('#houseno_detail').val(data.address.houseNo);
            $.ap('#postalcode_detail').val(data.address.postalCode);
            // set href of complaint photo

            updateAvgRating(data.averageRating);

            // set static map image
            var mapUrl = App.staticMap(data.address, 17, 400, 300 );
            mapUrl = 'url('+mapUrl+')';
            $.ap('#map_image_detail').css('background-image', mapUrl);

            // get own rating from server
            $.getJSON(App.RESOURCE_COMPLAINTS+complaint_id+'/ratings/', {
                user__username: App.username
            }).success(function(data) {
                var start = 0.1;
                var readOnly = false;

                if(parseInt(data.meta.total_count) > 0) {
                    start = data.objects[0].value;
                    readOnly = true;
                }

                updateOwnRatingDisplay(start, readOnly, complaint_id);
            });

            // hide empty fields
            $.ap("input").each(function(key, val) {
                if ($.ap(val).val() === "") {
                    $.ap(val).parent().hide();
                }
            });

            // get comments for current complaint
            fetchComments(complaint_id, COMMENTS, 0);

            // form validation
            // the following hack is required because it's not trivial to re-bind
            // the submit handler
            App.tmp_cid = complaint_id;
            $.ap(COMMENT_FORM).validate({submitHandler: function(form) {
                $.ap(COMMENT_SUBMIT).button('disable');

                $.post(App.RESOURCE_COMPLAINTS+App.tmp_cid+'/comments/',
                    $.ap(COMMENT_FORM).serialize()).always(function(data) {
                        $.ap('#message_detail').val('');
                        fetchComments(App.tmp_cid, COMMENTS, 0);
                        $.ap(COMMENT_SUBMIT).button('enable');
                    });
                }
            });
        });
    });
}).call(this);
