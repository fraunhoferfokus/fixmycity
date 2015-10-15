var GoogleGeocoder = function(){
	this.provider = "google";
	this.geocoder = new google.maps.Geocoder();
}

GoogleGeocoder.prototype.getAddress = function(loc,callback){
	var latlngGoogle = new google.maps.LatLng(loc.lat, loc.lng);
	this.geocoder.geocode({'latLng': latlngGoogle}, function(results, status) {
		if(status == google.maps.GeocoderStatus.OK) {
			var address = {};
			var res = results[0];
	      // only perform if we have fine-grained information
	      if(res.types.indexOf('street_number' >= 0)) {
	          // parse address components
	          $.each(res.address_components, function(k, address_component) {
	              $.each(address_component.types, function(k, type) {
	                  switch(type) {
	                      case 'street_number':
	                    	  address.houseNo = address_component.short_name;
	                          break;
	                      case 'route':
	                    	  address.street = address_component.short_name;
	                          break;
	                      case 'locality':
	                    	  address.city = address_component.short_name;
	                          break;
	                      case 'country':
	                    	  address.country = address_component.short_name;
	                          break;
	                      case 'postal_code':
	                    	  address.postalCode = address_component.short_name;
	                          break;
	                  }
	              });
	          });
	      }
	      callback(address);
	  } else {
	      console.log("=== Reverse geocoding failed due to: " + status);
	      callback(null);
	  }
	});
};