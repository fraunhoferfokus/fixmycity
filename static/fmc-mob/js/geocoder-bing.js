var BingGeocoder = function(){
	this.provider = "bing";
}

BingGeocoder.prototype.getAddress = function(loc,callback){
	var lat = loc.lat;
	var lng = loc.lng;
	var key = settings.BING_MAP_API_KEY;
	$.getJSON('http://dev.virtualearth.net/REST/v1/Locations/'+lat+','+lng+'?o=json&key='+key+'&jsonp=?', function(data) {
		
		var addressBingFormat = data.resourceSets[0].resources[0].address;
		
		var address = {
			  city: addressBingFormat.locality
			, country: addressBingFormat.countryRegion
			, postalCode: addressBingFormat.postalCode
			, street: addressBingFormat.addressLine
		};
		
		callback(address);
	});
};