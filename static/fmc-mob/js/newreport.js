var MAP_CANVAS	 = '#map_canvas_new'
	, CATEGORY_PICKER  = '#category_picker_new'
	, MAIN_FORM        = '#newreport_form'
	, PHOTO_FORM       = '#photo_upload_form'
	, IMG_PREVIEW_DIV  = '#img_preview_div'
	, FILE_INPUT       = '#form_file_new'
	, PG_FILE_INPUT    = '#pgPath_new'
	, GET_LOCATION_BTN = '#get_location_new'
	, SUBMIT_BTN       = '#submit_new'
	, DEFAULT_LOC 	   = {lat: 52.523405, lng: 13.41139899999996}
 	, geoLoc
	;


(function() {
    // <div>s
	if(typeof settings == "undefined" || !settings){
		settings = {
  			  MAP_PROVIDER: "google"
  			, GEOCODER_PROVIDER: "google"
  			, BING_MAP_API_KEY: " "
  		};
	}
	
	console.log("=== Selected Map Provider: " + settings.MAP_PROVIDER + " ; " +
			    " Selected Geocoding Provider: " + settings.GEOCODER_PROVIDER);

	// create new map with id = map_canvas_id
	
    if(settings.MAP_PROVIDER == "bing"){
    	map = new BingMap(MAP_CANVAS);
    }else{
    	map = new GoogleMap(MAP_CANVAS);
    }
    
    
    if(settings.GEOCODER_PROVIDER == "bing"){
    	geoCoder = new BingGeocoder();
    }else{
    	geoCoder = new GoogleGeocoder();
    }

    // Change page to report details page with id 'cid'
    function toDetailsPage(cid, boolCrosspost) {
        var redirect      = './detail?cid='+cid
          , crosspost_url = App.RESOURCE_CROSSPOST+'?cid='+cid;
        if(boolCrosspost === true) {
            $.post(crosspost_url).always(function() {
                $.mobile.changePage(redirect);
            });
        } else {
            $.mobile.changePage(redirect);
        }
    }

    // Top level function called for form submission
    function doReportPost(latlng) {
        var boolCrosspost = ($('#crosspostYesNo').val() === 'true') ? true : false;

        var submitCallback = function(data) {
            var cid           = data.id
              , form_filename = $.ap(FILE_INPUT).val() || ""
              , pg_filename   = $.ap(PG_FILE_INPUT).val() || "";

            var pg_upload_win = function(response) {
                console.log("Code: "     + response.responseCode);
                console.log("Response: " + response.response);
                console.log("Sent: "     + response.bytesSent);

                // code duplication for iOS. Same as 'toDetailsPage'.
                var redirect      = './detail?cid='+cid
                  , crosspost_url = App.RESOURCE_CROSSPOST+'?cid='+cid;
                if(boolCrosspost === true) {
                    $.post(crosspost_url).always(function() {
                        $.mobile.changePage(redirect);
                    });
                } else {
                    $.mobile.changePage(redirect);
                }
            }

            var pg_upload_fail = function(error) {
                alert("ERROR. Photo upload: " +  error.code);

                toDetailsPage(cid, boolCrosspost);
            }

            var normal_upload = function(cid) {
                ajaxImageUpload($.ap(PHOTO_FORM), cid).done(function() {
                    toDetailsPage(cid, boolCrosspost);
                });
            }

            var phonegapUpload = function(cid, filename) {
                var HOST = "http://mashweb.fokus.fraunhofer.de";
                // do phonegap image upload
                var upload_url   = HOST+App.RESOURCE_REPORTS+cid+'/photos/'
                  , options      = new FileUploadOptions()
                  , filetransfer = new FileTransfer();
                options.fileKey = 'photo';
                options.fileName = filename.substr(filename.lastIndexOf('/')+1);
                options.mimeType = 'image/jpeg';
                options.chunkedMode = false;


                filetransfer.upload(filename, encodeURI(upload_url),
                                    pg_upload_win, pg_upload_fail, options);
            }

            // choose to upload from normal input field or via phonegap API
            if(form_filename.length > 0) {
                normal_upload(cid);
            } else if(pg_filename.length > 0) {
              phonegapUpload(cid, pg_filename);
            } else {
                toDetailsPage(cid, boolCrosspost);
            }
        }

        var submitForm = function() {
            $.post(App.RESOURCE_REPORTS, $.ap(MAIN_FORM).serialize(),
                   submitCallback, "json");
        }
        
        if(typeof  latlng === 'undefined'){
        	latlng = DEFAULT_LOC;
        }
        
        $.ap('#form_latitude').val(latlng.lat);
        $.ap('#form_longitude').val(latlng.lng); 
        
        var dfd = $.Deferred();
        
        geoCoder.getAddress(latlng, function(address){
        	if (address) {
				$.ap('#form_houseNo').val(address.houseNo || '');
				$.ap('#form_street').val(address.street || '');
				$.ap('#form_city').val(address.city || '');
				$.ap('#form_countryCode').val(address.country || '');
				$.ap('#postal_code').val(address.postalCode || '');
				dfd.resolve();
				dfd.always(submitForm);
			}
        	else {
        		dfd.reject();
        		dfd.always(submitForm)
        	}
        });
    }


    // serialize the form 'form' and upload as image for report 'cid'
    function ajaxImageUpload(form, cid) {
        var dfd = $.Deferred();
        form.ajaxSubmit({
            url: App.RESOURCE_REPORTS+cid+'/photos/',
            type: 'POST',
            dataType: 'json',
            resetForm: true,
            iframe: true,
            forceSync: true,
            success: dfd.resolve
        });
        return dfd.promise();
    }

    // PAGEINIT
    $('#newreport').live('pageinit', function() {
        console.log("=== pageinit for #newreport");
        
    	map.init();
       	
    	map.center(DEFAULT_LOC);
       	
       	marker = map.addMarker(DEFAULT_LOC);

		map.moveMarker(marker,DEFAULT_LOC);
            	
    	map.on('click',function(loc){
    		map.moveMarker(marker, loc);
    		geoLoc = loc;
    	});
    	
        // form validation
        $(MAIN_FORM).validate({
            submitHandler: function(form) {
                $(SUBMIT_BTN).button('disable');
                doReportPost(geoLoc);
            }
        });

        // attach click listener to "Locate me" button
        $(GET_LOCATION_BTN).click(function() {
            if(navigator.geolocation) {
                $.mobile.showPageLoadingMsg();
                navigator.geolocation.getCurrentPosition(function(position) {
                	
                	var loc = {lat: position.coords.latitude, lng: position.coords.longitude};
                	map.moveMarker(marker, loc);
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
    $('#newreport').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #newreport");

        // reset forms and buttons
        $.ap('#form_title_new').val('');
        $.ap('#form_description_new').val('');
        if ($.ap(PHOTO_FORM)[0]) { // PhoneGap clients don't have this form
            $.ap(PHOTO_FORM)[0].reset();
        }
        if ($.ap(PG_FILE_INPUT).length > 0) {
            $.ap(PG_FILE_INPUT).val('');
        }
        $.ap(IMG_PREVIEW_DIV).hide();
        $.ap(FILE_INPUT).show();
        $.ap(SUBMIT_BTN).button('enable');
          	
    });

    // PAGESHOW
    $('#newreport').live('pageshow', function() {
        console.log("=== pageshow for #newreport");
        var height = $(MAP_CANVAS).height(); 
        var width = $(MAP_CANVAS).width();
    	map.resize(height,width); 	
    });

// 	does'nt work in IE:
    
//	$(window).resize(function() {
//		var height = $(MAP_CANVAS).height(); 
//		var width = $(MAP_CANVAS).width();
//		map.resize(height,width); 
//	});
    
	window.onresize = function(event){
		var height = $(MAP_CANVAS).height(); 
		var width = $(MAP_CANVAS).width();
		map.resize(height,width);
	};
	
}).call(this);
