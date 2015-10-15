(function() {

	if(typeof settings == "undefined" || !settings){
		settings = {
  			  MAP_PROVIDER: "google"
  			, GEOCODER_PROVIDER: "google"
  			, BING_MAP_API_KEY: " "
  		};
	}
	
    function handleNoGeolocation() {
        $.mobile.hidePageLoadingMsg();
        map.moveMarker(marker, geoLoc);
    }

    var map, geoLoc, marker, circle, rad;
    var SLIDER = "#slider_nearby";

    $('#reportsnearby').live('pageinit', function() {
        console.log("=== pageinit for #reportsnearby");

        // create map related items
        
        if(settings.MAP_PROVIDER == "bing"){
        	map = new BingMap("#map_canvas_nearby");
        }else{
        	map = new GoogleMap("#map_canvas_nearby");
        }
        
        geoLoc = DEFAULT_LOC;        
        map.init();
        map.center(DEFAULT_LOC);
        marker = map.addMarker(DEFAULT_LOC);
        map.on('click',function(loc){
    		map.moveMarker(marker, loc);
    		geoLoc = loc;
    	});
        

//        circle = new google.maps.Circle({
//            map : map,
//            center: geoLoc,
//            fillColor: '#999999',
//            fillOpacity: 0.5,
//            strokeOpacity: 0.5,
//            strokeWeight: 1,
//            clickable: false
//        });

        // bind circle to marker
//        circle.bindTo('center', marker, 'position');

        var lastRad = parseInt($(SLIDER).val());
        $(SLIDER).change(function() {
            rad = parseInt($(SLIDER).val());
            if(lastRad != rad) {
                // circle.setRadius(rad*1000);
                lastRad = rad;
            }
        });


        // button to trigger the actual search
        $('#show_nearby').click(function() {
            var params = {
            	latitude : geoLoc.lat,
            	longitude : geoLoc.lng,            		
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

    $('#reportsnearby').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #reportsnearby");

        $('#show_nearby').button('enable');

        // get radius from slider
        rad = (parseInt($(SLIDER).val()) || 10);
//         circle.setRadius(rad*1000);

        // try to get current user location
        if(navigator.geolocation) {
            $.mobile.showPageLoadingMsg();
            navigator.geolocation.getCurrentPosition(function(position) {
            	geoLoc = {lat: position.coords.latitude,
            			lng: position.coords.longitude};
            	map.moveMarker(marker, geoLoc);
                $.mobile.hidePageLoadingMsg();
            }, handleNoGeolocation);
        } else {
            handleNoGeolocation();
        }
    });

    $('#reportsnearby').live('pageshow', function() {
        console.log("=== pageshow for #reportsnearby");

        // workaround for drawing bug
        // google.maps.event.trigger(map, 'resize');
        
        var height = $("#map_canvas_nearby").height(); 
        var width = $("#map_canvas_nearby").width();
    	map.resize(height,width); 	
    });
    
// 	does'nt work in IE:
    
	$(window).resize(function() {
		var height = $("#map_canvas_nearby").height(); 
		var width = $("#map_canvas_nearby").width();
		map.resize(height,width); 
	});
	
//	window.onresize = function(event){
//		var height = $("#map_canvas_nearby").height(); 
//		var width = $("#map_canvas_nearby").width();
//		map.resize(height,width);
//	}
	
}).call(this);
