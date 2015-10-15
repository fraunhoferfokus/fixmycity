(function() {
    // move marker to given position and update the circle radius
    function moveMarker(marker, latLng) {
        if(marker !== null && typeof marker !== 'undefined') {
            marker.setPosition(latLng);
        }
        marker.map.panTo(latLng);
    }

    function handleNoGeolocation() {
        $.mobile.hidePageLoadingMsg();
        moveMarker(marker, geoLoc);
    }

    var map, geoLoc, marker, circle, rad;
    var SLIDER = "#slider_nearby";

    $('#complaintsnearby').live('pageinit', function() {
        console.log("=== pageinit for #complaintsnearby");

        // create map related items
        geoLoc = new google.maps.LatLng(-34.397, 150.644);

        map = new google.maps.Map($("#map_canvas_nearby").get(0), {
            zoom : 13,
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            center: geoLoc,
            keyboardShortcuts: false,
            overviewMapControl: false,
            panControl: false,
            rotateControl: false,
            scaleControl: false,
            streetViewControl: false
        });

        marker = new google.maps.Marker({
            position : geoLoc,
            map : map
        });

        circle = new google.maps.Circle({
            map : map,
            center: geoLoc,
            fillColor: '#999999',
            fillOpacity: 0.5,
            strokeOpacity: 0.5,
            strokeWeight: 1,
            clickable: false
        });

        // bind circle to marker
        circle.bindTo('center', marker, 'position');

        var lastRad = parseInt($(SLIDER).val());
        $(SLIDER).change(function() {
            rad = parseInt($(SLIDER).val());
            if(lastRad != rad) {
                circle.setRadius(rad*1000);
                lastRad = rad;
            }
        });

        google.maps.event.addListener(map, 'click', function(event) {
            moveMarker(marker, event.latLng);
            geoLoc = event.latLng;
        });

        // button to trigger the actual search
        $('#show_nearby').click(function() {
            var params = {
                latitude : geoLoc.lat(),
                longitude : geoLoc.lng(),
                order_by : '-creationTime',
                radius : rad,
                _heading : 'Reports Nearby'
            };
            $(this).button('disable');
            $.mobile.changePage('./list', {
                data: params
            });
            return false;
        });
    });

    $('#complaintsnearby').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #complaintsnearby");

        $('#show_nearby').button('enable');

        // get radius from slider
        rad = (parseInt($(SLIDER).val()) || 10);
        circle.setRadius(rad*1000);

        // try to get current user location
        if(navigator.geolocation) {
            $.mobile.showPageLoadingMsg();
            navigator.geolocation.getCurrentPosition(function(position) {
                geoLoc = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                moveMarker(marker, geoLoc);
                $.mobile.hidePageLoadingMsg();
            }, handleNoGeolocation);
        } else {
            handleNoGeolocation();
        }
    });

    $('#complaintsnearby').live('pageshow', function() {
        console.log("=== pageshow for #complaintsnearby");

        // workaround for drawing bug
        google.maps.event.trigger(map, 'resize');
    });
}).call(this);
