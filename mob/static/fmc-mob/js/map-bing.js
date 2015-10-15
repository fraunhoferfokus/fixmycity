
/*******************************************************************************
 * 
 * Copyright (c) 2015 Fraunhofer FOKUS, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>. 
 * 
 * AUTHORS: Louay Bassbouss (louay.bassbouss@fokus.fraunhofer.de)
 *
 ******************************************************************************/


(function(){
	if (typeof BingMap != "undefined") {
		return;
	}
	
	BingMap = function(id){
		this.id = id;
		this.bingMap = null;
		this.markers = {};
	}
	
	BingMap.prototype.init = function(){	
		var mapConfig = {
				credentials 		: settings.BING_MAP_API_KEY,
				zoom 				: 14,
				enableSearchLogo	: false,
				showMapTypeSelector : false,
				mapTypeId			: Microsoft.Maps.MapTypeId.road
			};
		this.bingMap = new Microsoft.Maps.Map($(this.id).get(0), mapConfig);
	};

	
	BingMap.prototype.center = function(loc){
		var bingLoc = new Microsoft.Maps.Location(loc.lat, loc.lng);
		this.bingMap.setView({center: bingLoc});
	};
	
	
	BingMap.prototype.addMarker = function(loc,options){
		/**
		 * options.icon or options.color
		 * options.html
		 */
		var markerId = Math.random().toString(36).substring(2);
		var bingMarkerLoc = new Microsoft.Maps.Location(loc.lat, loc.lng);
		var bingMarker = new Microsoft.Maps.Pushpin(bingMarkerLoc);
		this.bingMap.entities.push(bingMarker);
		this.markers[markerId] = bingMarker
		
		return markerId;
	};
	
	BingMap.prototype.moveMarker = function(markerId,loc){
		var bingMarker = this.markers[markerId];
		if (bingMarker){
			var newMarkerPosition = new Microsoft.Maps.Location(loc.lat,loc.lng); 
			this.markers[markerId].setLocation(newMarkerPosition);
			this.bingMap.setView({center: newMarkerPosition});
		}
	};
	
	
	BingMap.prototype.deleteMarker = function(markerId){
		var bingMarker = this.markers[markerId];
		if (bingMarker) {
			//TODO remove from bing map
		}
		delete this.markers[markerId];
	};
	
	
	BingMap.prototype.getMarker = function(markerId){
		var bingMarker = this.markers[markerId];
		if (bingMarker) {
			//TODO get bing marker position as latlng
		}
		return {
			lat: latlng.latitude,
			lng: latlng.longitude
		}
	};
	
	
	BingMap.prototype.resize = function(h,w){
		this.bingMap.setOptions({ height: h, width: w });
	};
	
	
	BingMap.prototype.on = function(eventType, callback){
		if (eventType == "click" && typeof callback == "function") {
			Microsoft.Maps.Events.addHandler(this.bingMap, 'click', function(event){
				var point = new Microsoft.Maps.Point(event.getX(), event.getY());
				var loc = event.target.tryPixelToLocation(point);
				callback({
					lat: loc.latitude,
					lng: loc.longitude
				});
			});
		}
	};
	
	
	BingMap.getStaticMap = function(loc,zoom,h,w){
    	var latStaticMap = loc.latitude;
    	var lngStaticMap = loc.longitude;
    	var mapUrl = 'http://dev.virtualearth.net/REST/V1/Imagery/Map/Road/'+
    					loc.latitude+','+loc.longitude+'/'+zoom+
    					'?mapSize='+h+','+w+
    					'&key='+settings.BING_MAP_API_KEY+
    					'&pp='+latStaticMap+','+lngStaticMap+';34';
		
		return mapUrl;
	}
	
})();

