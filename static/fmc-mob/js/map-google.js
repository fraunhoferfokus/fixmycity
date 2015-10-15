(function(){
	if (typeof GoogleMap != "undefined") {
		return;
	}
	
	GoogleMap = function(id){
		this.id = id;
		this.googleMap = null;
		this.markers = {};
	}
	
	GoogleMap.prototype.init = function(){
		this.googleMap = new google.maps.Map($(this.id).get(0), {
			zoom: 14,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			keyboardShortcuts: false,
			overviewMapControl: false,
			panControl: false,
			rotateControl: false,
			scaleControl: false,
			streetViewControl: false
		});

	};

	GoogleMap.prototype.center = function(loc){
		var googleLoc = new google.maps.LatLng(loc.lat,loc.lng);
		this.googleMap.center = googleLoc;
	};
	
	GoogleMap.prototype.addMarker = function(loc){
		var markerId = Math.random().toString(36).substring(2);
		var googleMarkerLoc = new google.maps.LatLng(loc.lat,loc.lng);
		var googleMarker = new google.maps.Marker({
									position: googleMarkerLoc,
									map: this.googleMap
							});
		this.markers[markerId] = googleMarker;
		return markerId;
	};
	
	GoogleMap.prototype.moveMarker = function(markerId,loc){
		var googleMarker = this.markers[markerId];
		if (googleMarker){
			var newMarkerPosition = new google.maps.LatLng(loc.lat,loc.lng); 
			this.markers[markerId].setPosition(newMarkerPosition);
			this.googleMap.panTo(newMarkerPosition);
		}
	};
	
	
	GoogleMap.prototype.deleteMarker = function(markerId){
		var googleMarker = this.markers[markerId];
		if (googleMarker) {
			//TODO remove from google map
		}
		delete this.markers[markerId];
	};
	
	
	GoogleMap.prototype.getMarker = function(markerId){
		var googleMarker = this.markers[markerId];
		if (googleMarker) {
			//TODO get google marker position as latlng
		}
		return {
			lat: latlng.lat(),
			lng: latlng.lng()
		}	
	};
	
	
	GoogleMap.prototype.resize = function(h,w){
		google.maps.event.trigger(this.googleMap, 'resize');
		//marker.map.setCenter(marker.position);
	};
	
	
	GoogleMap.prototype.on = function(eventType, callback){
		if (eventType == "click" && typeof callback == "function") {
			google.maps.event.addListener(this.googleMap, 'click', function(event) {
				var latLng = event.latLng;
				callback({
					lat: event.latLng.lat(),// latLng.Ya,
                                   lng: event.latLng.lng(),//latLng.Za
				});
			});
		}
	};
	
	
	GoogleMap.getStaticMap = function(loc,zoom,w,h){	
        var url = 'http://maps.googleapis.com/maps/api/staticmap?sensor=false&maptype=roadmap';
        url += '&markers=color:blue|' + loc.latitude + ',' + loc.longitude;
        url += '&format=jpg&zoom=' + zoom;
        url += '&scale=1&size=' + Math.round(w) + 'x' + Math.round(h);
        return url;
	}
	
})();
