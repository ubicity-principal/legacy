/**
* This file is part of a proof of concept implementation of a biodiversity 
* surveying application, which was developed by AIT Austrian Institute of 
* Technology GmbH within FP7 ENVIROFI research project. 
* It demonstrates the use of MDAF - Mobile Data Acquisition Framework 
* (renamed "ubicity" in 09/2013)  
* 
* See <catalogue.envirofi.eu/> and <www.envirofi.eu/> for more details.
* More information on ubicity at <www.ubicity.eu/?>
* 
* This prototype is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* This software is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with the sources.  If not, see <http://www.gnu.org/licenses/>.
**/
/**
  * @file js/vtl_meta.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short Provides an interface between Sencha Touch 2 and PhoneGap. All functionality of the
  *        application which may not be covered by the Sencha Touch 2 main controller is implemented
  *        in this file.
  *        vtl_meta.js will be compiled to vtl.js when the ant 
  *        build is performed and the string constants are replaced by the strings
  *        defined in the .properties files.
  */

/** Saves the current position in a globally available object. */
var currentPosition = {
	lon: null,
	lat: null,
	alt: null
};

/** Pointer to the GPS watcher which periodically returns the current position. */
var locationWatchId = null;

/** 
  * Saves the boundaries of the most recently calculated bounding box such that 
  * the next search may simply take the size of this bounding box.
  */
var oldBbox = {
	left: null,
	bottom: null,
	right: null,
	top: null
};

/** Saves whether the application is currently calculating a new bounding box. */
var calcBbox = false;
var calcBboxStop = false;

/** Global Strings used for dialogs e.g. in treemap.js */
var cancelString = '@treeapp.dialog.cancelLabel@';
var saveString = '@treeapp.dialog.saveLabel@';
var AoINamePrompt = '@treeapp.view.TreeMap.AoIName@';

var devReady = false;

// timestamp of gps signal for use in function positionValid 
var lastGPSSignalTime = 0;

// add event listener for phonegap and start location service as soon as available
document.addEventListener("deviceready", onDeviceReady, false);

// add event listener in case app gets into background
document.addEventListener("pause", pauseGeoLocation, false);
// add event listener in case app is restarted in foreground
document.addEventListener("resume", resumeGeoLocation, false);

/**
 * adds an NDEF listener for NFC Tags with a treeid as payload
 * after reading the treeid, the treedetail window of the tree with the id is shown
 * @param nfcEvent ... Data of the tag
 * @return
 */

function onNfc(nfcEvent){
	console.log("!!! NDEF FORMATTED TAG DETECTED !!!");
	if (menuState == 'inMainNavigation') {
    	console.log(JSON.stringify(nfcEvent.tag));
    	var tag = nfcEvent.tag;
    	var records =tag.ndefMessage || [];
    	var id;
    	
    	for (var i = 0; i<records.length; i++){
    		var record = records[i];
    		id = nfc.bytesToString(record.payload);
    	}
    	console.log('DATA: ' + id);	
    	var doc = {_id: id};
    	getTreedata(doc);
	}
}

/**
 * @brief Initial function wich triggers a geolocation single shot. Registers geolocationSuccess 
 *        and geolocationError as callback functions in case of error and success, respectively.
 */
function onDeviceReady() {
	console.log("Device Ready! [" + device.platform + "]");
	nfc.addNdefListener(
			onNfc, 
			function(){
				console.log("NDEF Success!");
			}, 
			function(){
				console.log("NDEF Error!");
			}
	);
    // App online listener
    document.addEventListener("online", onOnline, false);
    
    // App offline listener
    document.addEventListener("offline", onOffline, false);
    
    // AppResume Listener
    document.addEventListener("resume", onResume, false);
    
    // add eventlistener for changing the orientation of the phone...
    //window.addEventListener("orientationchange", orientationChange, true);
	devReady = true;
}

///**
//* When Device is online it fires this event
//*/
function onOnline() {
 // Handle the online event
  console.log("--------------------------- online ----------------------------");
  if (menuState == 'inMainNavigation') {
      showTreeMap("treemap", "commontreestore");
  }
  // load FI-Ware javascript for login to IDM GE:
  console.log("@fiWare.IDM.url@");
  loadScript("@fiWare.IDM.url@", loginFiWareTestbed);
}

/**
* When Device is offline it fires this event
*/
function onOffline() {
 // Handle the offline event
  console.log("--------------------------- offline ---------------------------");
  if (menuState == 'inMainNavigation') {
      showTreeMap("treemap", "commontreestore");
  }
}

/**
* When Device resumes it fires this event
*/
function onResume() {
 // Handle the resume event
  console.log("--------------------------- resume ---------------------------");
  if (menuState == 'inMainNavigation') {
      showTreeMap("treemap", "commontreestore");
  }
}

/**
 * @brief Initial function wich triggers a geolocation single shot. Registers geolocationSuccess 
 *        and geolocationError as callback functions in case of error and success, respectively.
 */
function initGeoLocation() {    
   // start watching current position
    navigator.geolocation.getCurrentPosition(geolocationSuccess, 
            geolocationError, { maximumAge: 5000, timeout: 10000, enableHighAccuracy: true });
}

/**
  * @brief Callback function in case the app gets in background mode. If a GPS watcher is enabled,
  *        it will be turned off and locationWatchId set to null.
  */
function pauseGeoLocation() {
	// clear location watch if it exists
	if (locationWatchId != null) {
		navigator.geolocation.clearWatch(locationWatchId);
		locationWatchId = null;
	}
}

/**
  * @brief Callback function in case the application is brought back into foreground. If the global app settings
  *        say to use GPS sensors, a new GPS watcher is established.
  */
function resumeGeoLocation() {
	// only start new location watch if it has been enabled
	if (typeof(appSettings) == 'undefined' || appSettings == null || appSettings.useGPS == true) {
		// start a new location watch only if it has not been started
		if (locationWatchId != null) {
			navigator.geolocation.clearWatch(locationWatchId);
		}
		locationWatchId = navigator.geolocation.watchPosition(watchPositionSuccess, 
			geolocationError, { /* frequency: 1000,*/ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	}
}

/**
  * @brief Callback function for the initial GPS watch. It saves the current position and starts a periodic GPS
  *        watcher. In case of success, watchPositionSuccess is called, geolocationError otherwise.
  * @param[in] position The position object as defined by PhoneGap.
  */
function geolocationSuccess(position) {
    
    if (appSettings.useGPS == true) {
        // set current position
        currentPosition.lon = position.coords.longitude;
        currentPosition.lat = position.coords.latitude;
        currentPosition.alt = position.coords.altitude;
        
        updateEventStore(currentPosition);
        
        // start a new location watch only if it has not been started
        if (locationWatchId != null) {
            navigator.geolocation.clearWatch(locationWatchId);
            locationWatchId = null;
        }
        locationWatchId = navigator.geolocation.watchPosition(watchPositionSuccess,
            geolocationError, { frequency: 1000, maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

    }
	
}

/**
  * @brief Callback function in case the GPS sensor could not retrieve the current location. An existing
  *        GPS watcher is cleared and the current location is set to the specified default location.
  * @param[in] error The error object as defined by PhoneGap.
  */
function geolocationError(error) {
	Ext.Msg.alert('', @treeapp.dialog.GPSError@);
	
	if (appSettings.useGPS == false) {
	    return;
	}
	
	// in case of error, set current location to specified default coordinates and disable GPS
	appSettings.useGPS = false;
	
	// disable the current watcher if it exists
	if (locationWatchId != null) {
		navigator.geolocation.clearWatch(locationWatchId);
	}
	
	// set current position to default values as specified in 
	// app settings
	currentPosition.lon = appSettings.defaultLocation.lon;
    currentPosition.lat = appSettings.defaultLocation.lat;
    currentPosition.alt = appSettings.defaultLocation.alt;
    
    updateEventStore(currentPosition);
}

/**
  * @brief Check if position is gps or cell tower position; switch to cell tower
  *        if gps was not available for the last 30 seconds
  * @param[in] position The position object as defined by PhoneGap.
  * @return true if position can be used; else false
 */
function positionValid(position) {
    if (position == null) {
        return false;
    }
    if (position.coords.altitude == null && position.coords.heading == null && position.coords.speed == null) {
        // cell tower position
        // switch to cell tower position when last gps signal is older than 20 seconds:
        if ((position.timestamp - lastGPSSignalTime) >= 20000) {
            return true;
        }
    }
    else {
        // save timestamp of gps signal:
        lastGPSSignalTime = position.timestamp;
    }
    return true;
}
/**
  * @brief Callback function in case the periodic GPS watch has been successfull. Triggers a new location watch,
  *        updates the center pin on the map and calculates a new bounding box in case the current position is within
  *        the boundaries of the 
  * @param[in] position The position object as defined by PhoneGap.
  */
function watchPositionSuccess(position) {
	// code taken from http://www.movable-type.co.uk/scripts/latlong.html
	// var R = 6371; // km
	// var dLat = ((currentPosition.lat-position.coords.latitude) / 180)*Math.PI;
	// var dLon = ((currentPosition.lon-position.coords.longitude) / 180)*Math.PI;
	// var lat1 = (position.coords.latitude / 180)*Math.PI;
	// var lat2 = (currentPosition.lat / 180)*Math.PI;

	// var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			// Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	// var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	// var d = R * c;
	
    if (appSettings.useGPS == false) {
        return;
    }
   
	if (positionValid(position) == false) {
		return;
	}
    /* 
    console.log('Latitude: '           + position.coords.latitude              + '<br />' +
                'Longitude: '          + position.coords.longitude             + '<br />' +
                'Altitude: '           + position.coords.altitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy              + '<br />' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                'Heading: '            + position.coords.heading               + '<br />' +
                'Speed: '              + position.coords.speed                 + '<br />' +
                'Timestamp: '          + new Date(position.timestamp) );
*/	

	
	
	if (treeMap !== undefined && treeMap != null) {
		
		if(appSettings.useGPS == true) {
			
			
			updateCenterPin(position.coords.longitude, position.coords.latitude);
			
			currentPosition.lon = position.coords.longitude;
        	currentPosition.lat = position.coords.latitude;
        	currentPosition.alt = position.coords.altitude;

        	updateEventStore(currentPosition);
		}

	}
}

/**
 * @brief Update the store "current_events_store" to display the n nearest new events around the given position
 * @param[in] pos the position around which the events shall be included in the store.
 * @param[in] n the amount of events which shall be stored.
 */
function updateEventStore(pos, n) {
	if (pos == undefined) {
		pos = currentPosition;
	}
	
	if (n == undefined) {
		if (appSettings && appSettings.mainMenuEventCount) {
			n = appSettings.mainMenuEventCount;
		}
		else {
			n = 5;
		}
	}
	
	if (pos.lon != 0 && pos.lat != 0) {
		var bbox = {
			left: pos.lon - 0.01,
			bottom: pos.lat - 0.01,
			right: pos.lon + 0.01,
			top: pos.lat + 0.01
		};
		
		var bboxParameter = "bbox=" + bbox.left + "," + bbox.bottom + "," + bbox.right + "," + bbox.top;
		console.log("URL: " + getCouchURL() + getCouchDBDatabasename() + "/_design/events/_spatial/_list/eventsdata/activeevents?" + bboxParameter);
		
		// load events from database
		var response = Ext.Ajax.request({
			url : getCouchURL() + getCouchDBDatabasename() + "/_design/events/_spatial/_list/eventsdata/activeevents?" + bboxParameter,
		    async : false,
		    success: function(response){  /* do nothing -> it is sync! */ },
		    failure:function(response, opts){
				console.log("LOAD ERROR: Could not load event documents!" + response.request.options.url);
			}
		});
					
		// collect events in data-array to be pushed to store
		var events = JSON.parse(response.responseText);
		console.log("Eventlist 1: " + response.responseText);
		var data = [];
		console.log("Eventlist 2: currentPosition = " + JSON.stringify(currentPosition));

		var currentPos = new LatLon(pos.lat, pos.lon);
		console.log("Eventlist 3");
		var now = new Date();
		for(i = 0; i < events.length; i++) {
			// the properties of this array match the fields defined in the eventstore
			if (!(events[i].visited || events[i].visited == 'true') && !(events[i].expired || events[i].expired == 'true')) {
				var created = new Date(events[i].timestamps.created);
				var expires = new Date(events[i].timestamps.expires);
				if (expires < now) {
					console.log("Event expired: " + expires);
					events[i].expired = 'true';
					userDB.putDoc(events[i]);
				} else {
					var icon = "";
					// try to determine the icon. if not possible use default icon.
					if(events[i].properties.icon.url) {
						icon = events[i].properties.icon.url;
					} else if(events[i].properties.icon.file) {
						icon = getCouchURL() + getCouchDBDatabasename() + "/" + events[i]._id + "/" + events[i].properties.icon.file;
					} else {
						icon = "img/envirofi.png";
					}
					// calculate distance to current position:
					var dist = currentPos.distanceTo(new LatLon(events[i].properties.geometry.coordinates[1], events[i].properties.geometry.coordinates[0]));
					var temp = {
						"_id" : events[i]._id,
						"heading" : events[i].properties.label,
						"provider" : "by " + events[i].properties.provider,
						"text" : formatTimeSpan(new Date(Date.parse(events[i].timestamps.created))) + " ago",
						"iconurl" : icon,
						"created" : created,
						"distance": dist
					}
					data.push(temp);
				}
			}
		}
		
		if (data.length > 0) {
			// push data to eventstore -> list updates and renders accordingly
			var eventstore = Ext.data.StoreManager.lookup('currenteventsstore');
			eventstore.setData(data);
			eventstore.sort([
			    new Ext.util.Sorter({
			    	property : 'distance',
			    	direction: 'ASC'
			    }),
			    new Ext.util.Sorter({
			    	property : 'created',
			    	direction: 'DESC',
			    	sorterFn: 
			    		function (o1, o2) {
				    		var v1 = new Date(o1.data.created);
				    		var v2 = new Date(o2.data.created);
				    		return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
				    	} 
			    })
		    ]);
			for (i = eventstore.getCount() - 1; i >= n; i--) {
				eventstore.removeAt(i);
			}
			Ext.getCmp('mainmenu_eventpanel').show();
		}
		else {
			Ext.getCmp('mainmenu_eventpanel').hide();
		}
	}
}

/**
  * @brief Calculates a bounding box based on the current position and the number of trees within this bounding box. 
  *        This number is from 25 to 50.
  * @param[in] bbox An object containing the boundaries in which new trees will be retrieved from the server.
  */
function calculateBoundingBox(bbox) {
	
	console.log("aborting calculate Bounding Box...");
	return;
	
	
	if (calcBboxStop) {
        calcBboxStop = false;
        return;
    }
    if (calcBbox == false) {
        console.log("started");
    }
    // url to countinfo for dynamic calculation of bounding box
    var countUrl;
    var localCountUrl;
    
    // inform other functions that we are currently calculating a new bounding box
    calcBbox = true;

	if(hasInternetConnection()){
	/*  if (appSettings.dataSource == 'viennatreestore') {
	        countUrl = 'http://envirofi.ait.ac.at/GeoCouch/viennatree/_design/main/_spatial/trees';
	    } else if (appSettings.dataSource == 'florencetreestore') {
	        countUrl = 'http://envirofi.ait.ac.at/GeoCouch/florencetree/_design/main/_spatial/trees';
	    }       
	*/  
	//  countUrl = 'http://envirofi.ait.ac.at/GeoCouch/treecommon/_design/main/_spatial/trees';
	    countUrl = '@mdafapp.server.db.url@' + '@mdafapp.server.db.db@' + '@mdafapp.server.db.design@' + '@mdafapp.server.db.spatial@' + '@mdafapp.server.db.observations@';
	    countUrl = countUrl + '?bbox=' + bbox.left + ',' + bbox.bottom +
	        ',' + bbox.right + ',' + bbox.top + '&count=true';
	    
	    //console.log("Request: BBox counter = " + countUrl);
	    
	    var req = new XMLHttpRequest();
	    req.open('GET', countUrl, true);
	    
    console.log(countUrl);
    
	    // retrieve number of trees in current bounding box
	    req.onreadystatechange = function () {
	        if (req.readyState == 4) {
	            // count not published, local objects in bbox
	        	
	            // evaluate answer and save it to object
	            var answer = JSON.parse(req.responseText);
	            var count = 0;
	            count += parseInt(answer.count);
	            var notPublished = null;
	            if(userDB != null){
	                if(userDB.exists()){
	                    var unpublishCount = userDB.getBBoxCount(bbox, true);
	                	count += parseInt(unpublishCount.count);
	                	console.log("unpublish: " + unpublishCount.count);
	                }
	            }           
	            
	            // if number of trees in current bounding box are too many, decrease
	            // size of bounding box
	            if (count > 50) {
	                var newBbox = {
	                    left: bbox.left + (bbox.right - bbox.left) / 4,
	                    bottom: bbox.bottom + (bbox.top - bbox.bottom) / 4,
	                    right: bbox.right - (bbox.right - bbox.left) / 4,
	                    top: bbox.top - (bbox.top - bbox.bottom) / 4,
	                };
	                console.log(">50 ... count = " + count);
	                calculateBoundingBox(newBbox);
	            } else if (count < 25) {
	                // number of trees in current bounding box is quite low, increase
	                // size of bounding box
	                var newBbox = {
	                    left: bbox.left - (bbox.right - bbox.left) / 4,
	                    bottom: bbox.bottom - (bbox.top - bbox.bottom) / 4,
	                    right: bbox.right + (bbox.right - bbox.left) / 4,
	                    top: bbox.top + (bbox.top - bbox.bottom) / 4,
	                };
	                // if bounding box is larger than about 50 kilometers, stop increasing it:
	                var width = newBbox.right - newBbox.left;
	                var height = newBbox.top - newBbox.bottom;
	                if ((width >= 0.4) || (height >= 0.4)) {
	                    oldBbox.left = bbox.left;
	                    oldBbox.bottom = bbox.bottom;
	                    oldBbox.right = bbox.right;
	                    oldBbox.top = bbox.top;
	                    if (count > 0) {
	                        replicateBBox(bbox);
	                    }
	                    else {
	                        updateTreeStore(bbox);
	                    }
	                    calcBbox = false;
	                } else {
	                    console.log("<25 ... count = " + count);
	                    calculateBoundingBox(newBbox);
	                }
	            } else {
	                // number of trees is ok => save current bounding box
	                // and update VTL store with new trees
	                oldBbox.left = bbox.left;
	                oldBbox.bottom = bbox.bottom;
	                oldBbox.right = bbox.right;
	                oldBbox.top = bbox.top;
	                
	                console.log("fertig ... count = " + count);
	                replicateBBox(bbox);
	                
	                // inform other functions that we have finished calculating
	                // a new bounding box
	                calcBbox = false;
	            }
		    }
	    };
	    req.send(null);
	} else {
    	console.log("offline BBox Calculation! ...");

    	var count  = userDB.getBBoxCount(bbox, false);
    	var localcount = count.count;
        if(localcount != null){
        	if (localcount > 50) {
                var newBbox = {
                    left: bbox.left + (bbox.right - bbox.left) / 4,
                    bottom: bbox.bottom + (bbox.top - bbox.bottom) / 4,
                    right: bbox.right - (bbox.right - bbox.left) / 4,
                    top: bbox.top - (bbox.top - bbox.bottom) / 4,
                };
                //console.log(">50 ... count = " + localcount);
                calculateBoundingBox(newBbox);
            } else if (localcount < 25) {
                // number of trees in current bounding box is quite low, increase
                // size of bounding box
                var newBbox = {
                    left: bbox.left - (bbox.right - bbox.left) / 4,
                    bottom: bbox.bottom - (bbox.top - bbox.bottom) / 4,
                    right: bbox.right + (bbox.right - bbox.left) / 4,
                    top: bbox.top + (bbox.top - bbox.bottom) / 4,
                };
                // if bounding box is larger than about 50 kilometers, stop increasing it:
                var width = newBbox.right - newBbox.left;
                var height = newBbox.top - newBbox.bottom;
                if ((width >= 0.4) || (height >= 0.4)) {
                    oldBbox.left = bbox.left;
                    oldBbox.bottom = bbox.bottom;
                    oldBbox.right = bbox.right;
                    oldBbox.top = bbox.top;
                    if (count > 0) {
                        replicateBBox(bbox);
                    }
                    else {
                        updateTreeStore(bbox);
                    }
                    calcBbox = false;
                } else {
                    //console.log("<25 ... count = " + localcount);
                    calculateBoundingBox(newBbox);
                }
            } else {
                // number of trees is ok => save current bounding box
                // and update VTL store with new trees
                oldBbox.left = bbox.left;
                oldBbox.bottom = bbox.bottom;
                oldBbox.right = bbox.right;
                oldBbox.top = bbox.top;
                
                console.log("fertig ... count = " + localcount);
                updateTreeStore(bbox);
                
                // inform other functions that we have finished calculating
                // a new bounding box
                calcBbox = false;
            }
        }
    }
}



/**
  * @brief Calculates a bounding box based on the current position and the radius AND replicates the Objects of Interes in this bbox
  */
function calculateBoundingBoxByRadius() {
	console.log("Started BBOX Calculation by RADIUS!!!");
	
	// get radius from the properties (has to be changed)
	var radius = appSettings.bboxradius;
	// earth radius in meter
	var R = 6371000;
	
	if(radius == null){
		console.log("Radiusproblem... set to 100");
		radius = 100;
	} else {
		console.log("Radius" + radius);
	}

	var curLat = currentPosition.lat;
	var curLon = currentPosition.lon;
	var pos = new LatLon(curLat, curLon);
	var newPosRightTop = pos.destinationPoint(45, radius/1000);
	var newPosLeftBottom = pos.destinationPoint(225, radius/1000);
	
	console.log('#############');
	console.log(newPosLeftBottom.lon() + ' - ' + newPosLeftBottom.lat() + ' - ' + newPosRightTop.lon() + ' - ' + newPosRightTop.lat());
	
	
	var bbox = {
        left: newPosLeftBottom.lon(),
        bottom: newPosLeftBottom.lat(),
        right: newPosRightTop.lon(),
        top: newPosRightTop.lat()
    };
	
    oldBbox.left = bbox.left;
    oldBbox.bottom = bbox.bottom;
    oldBbox.right = bbox.right;
    oldBbox.top = bbox.top;

	replicateBBox(bbox);
}



/**
  * @brief Returns the downloadsize for all Object of Interest and its Observations, in this boundingbox...
  * @param[in] bbox An object containing the boundaries in which new trees will be retrieved from the server.
  */
function getBoundingBoxDownloadsize(bbox) {
	
	
	// url to countinfo for dynamic calculation of bounding box
    var size = -1;

	if(hasInternetConnection()){
		var url = '@mdafapp.server.db.utils@' + '@mdafapp.server.db.utils.caching.getSize@';
		url += 'bbox=' +  bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top;
		
		console.log("url: " + url);
		
		var req = new XMLHttpRequest();
		req.timeout = 200;
		
		req.open('GET', url, false);
		req.send(null);
		
		if (req.readyState == 4) {
		   if(req.status == 200 || req.status == 202){

				var answer = JSON.parse(req.responseText);
				console.log("req.responseText: " + req.responseText);
		        var count = 0;
		        count += parseInt(answer.count);
		        size = count*0.002;
		    	return size;
		    	
		   } else {
		       console.log("No Internet Connection .... !!");
		       return size;
	       }
	   }
		/*

		// retrieve number of trees in current bounding box
		req.onreadystatechange = function () {
			console.log("url: " + url);
			if (req.readyState == 4) {
				console.log("test 1");
				var answer = JSON.parse(req.responseText);
				console.log("req.responseText: " + req.responseText);
		        var count = 0;
		    	console.log("count: " + count);
		        count += parseInt(answer.count);

		    	console.log("count2: " + count);
		        size = count*0.001;
		    	console.log("size: " + size);
		    	return size;
			}
		};
		*/
	} else {
	    return size;
	}
}


/**
 * @brief Updates the tree store based on the given bounding box. The new trees will be automatically displayed
 *        in the list and map view.
 * @param[in] bbox An object containing the boundaries in which new trees will be retrieved from the server.
 */
function updateTreeStore(bbox) {

	console.log("(2) UPDATE TREE STORE");

	
   // get current store
   var treeStore = Ext.data.StoreManager.lookup('commontreestore');
   
   if (treeStore == undefined) {
       console.log("Tree store not found!");
   }
   
   // only reload treeStore if it has already been initialized
   if (treeStore != undefined) {
       treeStore.removeAll();
       // we have no valid position yet
       if ((typeof(device) != 'undefined') && (currentPosition.lat == null || currentPosition.lon == null)) {
           return;
       }
       // get current store url
       var storeUrl = treeStore.getProxy().getUrl();
       // get end of "real" url
       if (storeUrl != null) {
           var endPos = storeUrl.indexOf('?bbox');
           
           // if bbox has been specified, replace it by new one
           if (endPos != -1) {
               storeUrl = storeUrl.slice(0, endPos);
           }
           
           // append current position to store proxy url
          // storeUrl = storeUrl + '?bbox=' +  bbox.left + ',' + bbox.bottom +
           //    ',' + bbox.right + ',' + bbox.top;
           
           //storeUrl = storeUrl + '?bbox=0,0,150,80';
           var storeUrl = getCouchURL() + activeDbName + "/_design/main/_list/treedata/trees";
           //storeUrl = getCouchURL() + "user" + "/_design/main/_spatial/treesShort?bbox=0,0,90,90";
           
           if(bbox) {
           	storeUrl = getCouchURL() + activeDbName + '/_design/main/_spatial/_list/treedataShort/treesShort?bbox=' +  bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top
           }
			
           console.log("REPLICATION: storeUrl " + storeUrl);
           // set new url for store proxy
           treeStore.getProxy().setUrl(storeUrl);
           // load data and update tree marker layer of map
           console.log("start fetching trees from local db ...");
           
           treeStore.load(function(records, operation, success) {
           			console.log("load from load() callback");
				     updateTreeMap('commontreestore', 'treeLayer');
				}, this);
				
				
       }
   } 
}
