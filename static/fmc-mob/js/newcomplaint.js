(function() {
    // move 'marker' to 'latLng' and center map
    function moveMarker(marker, latLng) {
        if(typeof marker !== "undefined" && marker !== null) {
            marker.setPosition(latLng);
        }
        marker.map.panTo(latLng);
    }

    // Top level function called for form submission
    function doComplaintPost(latlng) {
        $.ap('#form_latitude').val(latlng.lat());
        $.ap('#form_longitude').val(latlng.lng());

        geocodeForm(latlng).always(function() {
            $.post(App.RESOURCE_COMPLAINTS,
                $.ap(MAIN_FORM).serialize(),
                function(data) {
                    // set resource to post image to
                    var filename = $.ap('#form_file_new').val() || "";
                    var pg_filename = $.ap('#pgPath').val() || "";
                    var redirect = './detail?cid='+data.id;

                    if(filename.length > 0) {
                        ajaxImageUpload($.ap(PHOTO_FORM), data.id).done(function() {
                            $.mobile.changePage(redirect);
                        });
                    } else if(pg_filename.length > 0) {
                        // do phonegap image upload
                        function win(r) {
                            console.debug("Code = " + r.responseCode);
                            console.debug("Response = " + r.response);
                            console.debug("Sent = " + r.bytesSent);

                            $.mobile.changePage(redirect);
                        }

                        function fail(error) {
                            alert("Photo Upload - error: Code = " +  error.code);
                        }

                        var options = new FileUploadOptions();
                        options.fileKey = 'photo';
                        //options.fileName = pg_filename.substr(pg_filename.lastIndexOf('/')+1);
                        //options.mimeType = 'image/jpeg';
                        //options.params = {};
                        options.chunkedMode = false;

                        var ft = new FileTransfer();
                        var url = HOST+App.RESOURCE_COMPLAINTS+data.id+'/photos/';

                        ft.upload(pg_filename, url, win, fail, options);
                    } else {
                        $.mobile.changePage(redirect);
                    }
                }, "json");
        });
    }

    // geocode a latlong and update the form with results
    function geocodeForm(latlng) {
        var dfd = $.Deferred();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
                var res = results[0];
                // only perform if we have fine-grained information
                if(res.types.indexOf('street_number' >= 0)) {
                    // parse address components
                    $.each(res.address_components, function(k, address_component) {
                        $.each(address_component.types, function(k, type) {
                            switch(type) {
                                case 'street_number':
                                    $.ap('#form_houseNo').val(
                                        address_component.short_name);
                                    break;
                                case 'route':
                                    $.ap('#form_street').val(
                                        address_component.short_name);
                                    break;
                                case 'locality':
                                    $.ap('#form_city').val(
                                        address_component.short_name);
                                    break;
                                case 'country':
                                    $.ap('#form_countryCode').val(
                                        address_component.short_name);
                                    break;
                                case 'postal_code':
                                    $.ap('#form_postalCode').val(
                                        address_component.short_name);
                                    break;
                            }
                        });
                    });
                }
                dfd.resolve();
            } else {
                dfd.reject();
                console.log("=== Reverse geocoding failed due to: " + status);
            }
        });
        return dfd;
    }

    // serialize the form 'form' and upload as image for complaint 'cid'
    function ajaxImageUpload(form, cid) {
        var dfd = $.Deferred();
        form.ajaxSubmit({
            url: App.RESOURCE_COMPLAINTS+cid+'/photos/',
            type: 'POST',
            dataType: 'json',
            resetForm: true,
            iframe: true,
            forceSync: true,
            success: dfd.resolve
        });
        return dfd.promise();
    }

    // <div>s
    var MAP_CANVAS = '#map_canvas_new';
    var CATEGORY_PICKER = '#category_picker_new';
    var MAIN_FORM = '#newcomplaint_form';
    var PHOTO_FORM ='#photo_upload_form';
    var IMG_PREVIEW_DIV = '#img_preview_div';
    var FILE_INPUT = '#form_file_new';
    var GET_LOCATION_BTN = '#get_location_new';
    var SUBMIT_BTN = '#submit_new';
    // the Google maps objects
    var geoLoc = new google.maps.LatLng(52.523405, 13.41139899999996);
    var map, marker;

    // PAGEINIT
    $('#newcomplaint').live('pageinit', function() {
        console.log("=== pageinit for #newcomplaint");

        map = new google.maps.Map($(MAP_CANVAS).get(0), {
            center: geoLoc,
            zoom: 14,
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            keyboardShortcuts: false,
            overviewMapControl: false,
            panControl: false,
            rotateControl: false,
            scaleControl: false,
            streetViewControl: false
        });
        marker = new google.maps.Marker({
            position: geoLoc,
            map: map
        });

        // add click listener to map
        google.maps.event.addListener(map, 'click', function(event) {
            moveMarker(marker, event.latLng);
            geoLoc = event.latLng;
        });

        // form validation
        $(MAIN_FORM).validate({
            //ignore: "#form_file_new",
            submitHandler: function(form) {
                $(SUBMIT_BTN).button('disable');
                doComplaintPost(geoLoc);
            }
        });

        // attach click listener to "Locate me" button
        $(GET_LOCATION_BTN).click(function() {
            if(navigator.geolocation) {
                $.mobile.showPageLoadingMsg();
                navigator.geolocation.getCurrentPosition(function(position) {
                    var loc = new google.maps.LatLng(position.coords.latitude,
                        position.coords.longitude);
                    moveMarker(marker, loc);
                    geoLoc = loc;
                    $.mobile.hidePageLoadingMsg();
                }, $.mobile.hidePageLoadingMsg);
            } else {
                console.log("=== Geolocation not available!");
            }
            return false;
        });

        // Fill category picker
        $.getJSON(App.RESOURCE_CATEGORIES, function(data) {
            var items = [];

            $.each(data.objects, function(key, val) {
                items.push('<option value="' + val.resource_uri + '">' + val.title + '</option>');
            });

            $(CATEGORY_PICKER).html(items.join('\n'));
            $(CATEGORY_PICKER).selectmenu('refresh', true);
        });
    });

    // PAGEBEFORESHOW
    $('#newcomplaint').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #newcomplaint");

        // reset forms and buttons
        $.ap(MAIN_FORM)[0].reset();
        if ($.ap(PHOTO_FORM)[0]) { // PhoneGap clients don't have this form
          $.ap(PHOTO_FORM)[0].reset();
        }
        $.ap(IMG_PREVIEW_DIV).hide();
        $.ap(FILE_INPUT).show();
        $.ap(SUBMIT_BTN).button('enable');
    });

    // PAGESHOW
    $('#newcomplaint').live('pageshow', function() {
        console.log("=== pageshow for #newcomplaint");

        // display bug workaround
        google.maps.event.trigger(map, 'resize');
        marker.map.setCenter(marker.position);
    });
}).call(this);
