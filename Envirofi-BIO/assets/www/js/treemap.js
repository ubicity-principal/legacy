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
  * @file js/treemap.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short Provides an interface between Sencha Touch 2 and OpenLayers. There are functions
  *        to create maps, set a center pin and add tree markers.
  */

/** Globally available OpenLayers map object. */
var treeMap = null;
/** Globally available string, representing the current type of the map */
var currentMap = null;
/** Static variable saving whether the current map shall follow the user by centering the map on each location change. */
var recenter = true;

/** OpenLayers projection for EPSG:4326 (GPS). */
var fromProjection = new OpenLayers.Projection("EPSG:4326"); 
/** OpenLayers projection for EPSG:900913 (Spherical Mercator). */
var toSMProjection = new OpenLayers.Projection("EPSG:900913");
/** OpenLayers projection for EPSG:3857 (Vienna WMTS). */
var toWMTSProjection = new OpenLayers.Projection("EPSG:3857");
/** OpenLayers projection for EPSG:31255 (Gau������-Kr������ger M31). */
var toGKProjection = new OpenLayers.Projection("EPSG:31255");

/** Url to tile server of open street map. */
var osmURL = "http://tile.openstreetmap.org";
//var osmURLoffline = "file:///storage/sdcard0/EnvirofiMaptiles";
var osmURLoffline = "";
/** Url to web map server of Tuscany. */
//var wmsURL = "http://web.rete.toscana.it/sgrwms/com.rt.wms.RTmap/_rt_wms_wgs84";  /** Name of the aerial layer for Tuscany web map server. */
//var wmsURL = "http://web.regione.toscana.it/wmsraster/com.rt.wms.RTmap/wms?map=wmsofc";
var wmsURL = "http://www502.regione.toscana.it/wmsraster/com.rt.wms.RTmap/wms?map=wmsofc&";
//var wmsLayer = 'otf10k10';
var wmsLayer = 'rt_ofc.10k10';

/** Url to Google maps elevation service: */
var elevationService = "http://maps.googleapis.com/maps/api/elevation/json?locations=";

/** Url to Google geocoder to retrieve address from location: */
var googleGeocoder = "http://maps.googleapis.com/maps/api/geocode/json?latlng=";


/** Static variable indicating how often the trigger for the crosshair button was called.
 *  This is a hack since on Android 4.1 the button control trigger is entered twice when the button is touched.
 *  Possibly this is not the case on another device/system => should be tested!
 */
var newObservationTrigger = 0;

/** Public data providers */
var publicProviders = ["Stadt Wien - data.wien.gv.at", "Comune di Firenze"];

// clustering variables
var strategy, clusters, noclusters;
var maxClusteringZoom = 4;

// features array for clustering
var features = [];

// estimated memory consumption for caching
var memSize = {
        'retVal': '',
        'tileCount': 0
    };

/**
 * @brief Sets the current map center to the specified position and the specified zoom level.
 * @param[in] lon GPS longitude coordinate of current position.
 * @param[in] lat GPS latitude coordinate of current position.
 * @param[in] zoomLevel The relative zoom level. Optional argument - if not given, the current zoom level
 *            of the map will be used.
 */
function centerMapToCoords(lon, lat, zoomLevel) {

	if (treeMap != null) {
   	
		if (typeof(zoomLevel) == 'undefined') {
			zoomLevel = treeMap.getZoom();
		}
   
		// Depending on the currently active map type, set center of map
		if (currentMap == 'WMS') {
			// bug in OpenLayers: you have to specify "true" if you do NOT want to
			// trigger move events!
			treeMap.setCenter(new OpenLayers.LonLat(lon,lat), zoomLevel, false, false);
		} else if (currentMap == 'OSM') {
			// last two boolean arguments in setCenter() imply that this action triggers the 'moveend' eventlistener			
			treeMap.setCenter(new OpenLayers.LonLat(lon,lat).transform(fromProjection, toSMProjection), zoomLevel, false, false);
		} else if (currentMap == 'WMTS') {
			treeMap.setCenter(new OpenLayers.LonLat(lon,lat).transform(fromProjection, toWMTSProjection), zoomLevel, false, false);
		}
	}

}

/**
 * @brief Callback function for the "moveend" event on the map layer. Creates a recenter
 *        button on the map in case it does not yet exist.
 */
function addRecenterButton() {	

	// check if there is already a recenter button
	var cPanel = treeMap.getControlsBy('displayClass', 'centerButtonControlPanel');
	if(cPanel.length >= 1) {
		// recenter button does already exist -> exit
		return;
	}

	// only create the button if we are currently updating the position of the user
	if (recenter) {
       
		// create new panel
		var panel = new OpenLayers.Control.Panel({displayClass: 'centerButtonControlPanel'});
       
		// create button with event handler which recenters the map and
		// destroys the contrel panel with the including button
		var recenterButton = new OpenLayers.Control.Button({
           trigger: function() {
               // recenter the map to current position
               if ((currentPosition.lon != null) && (currentPosition.lat != null)) {
                   centerMapToCoords(currentPosition.lon, currentPosition.lat);
                   //updateCenterPin(currentPosition.lon, currentPosition.lat);
               } else {
                   centerMapToCoords(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat);
                   //updateCenterPin(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat);
               }
              
               // destroy control panel
               var cPanel = treeMap.getControlsBy('displayClass', 'centerButtonControlPanel');
               cPanel[0].destroy();
               // set recenter state to true
               recenter = true;
           },
           displayClass: "centerButton"
       });
       
       // add button to control panel
       panel.addControls([
           recenterButton
       ]);
       
       // add control panel to map
       treeMap.addControl(panel);
       
       // save that we are currently not recentering the position of the user
       recenter = false;
       
   }
   
}

/**
 * @brief Add a button on the top right corner of the map to start entering a new OoI.
 * A crosshair button is placed at the center of the map. When this button is touched, 
 * the map location beyond the crosshair is taken as the new objects geolocation and a
 * form for entering object properties is opened.
 */
function addNewObservationButton() {

   // create new panel
   var panel = new OpenLayers.Control.Panel({displayClass: 'newObservationButtonControlPanel'});
   
   // create button with event handler which recenters the map and
   // destroys the contrel panel with the including button
   var newObservationButton = new OpenLayers.Control.Button({
       trigger: function() {
           newObservationTrigger = newObservationTrigger+1;
           if (newObservationTrigger == 2) {
               // if newObservationControl is currently shown, remove it:
               var cPanel = treeMap.getControlsBy('displayClass', 'fixMarkerPanel');
               if (cPanel[0] != null) {
                   cPanel[0].destroy();
               }
               else {
                   var fixPanel = new OpenLayers.Control.Panel({displayClass: 'fixMarkerPanel'});
                   var fixButton = new OpenLayers.Control.Button({ 
                       trigger: function() {
                          var mapCenter;
                          var address = null;
                          var elevation = null;
                          // get position:
                          if (currentMap == 'WMS') {
                              mapCenter = treeMap.getCenter();
                          } else if (currentMap == 'OSM') {
                              mapCenter = treeMap.getCenter().transform(toSMProjection, fromProjection);
                          } else if (currentMap == 'WMTS') {
                              mapCenter = treeMap.getCenter().transform(toWMTSProjection, fromProjection);
                          }
                          if(hasInternetConnection()){
                              // retrieve elevation:
                              var req = new XMLHttpRequest();
                              var url = elevationService + mapCenter.lat + "," + mapCenter.lon + "&sensor=true";
                              var answer;
                              req.open('GET', url, false);
                              req.send(null);                     
                              if (req.readyState == 4) {
                                  console.log("in readyState");
                                  answer = JSON.parse(req.responseText);
                                  if (answer != null && answer.status == "OK") {
                                      elevation = answer.results[0].elevation;
                                  }
                              }
                              // retrieve address:
                              req = new XMLHttpRequest();
                              url = googleGeocoder + mapCenter.lat + "," + mapCenter.lon + "&sensor=true";
                              req.open('GET', url, false);
                              req.send(null);
                              if (req.readyState == 4) {
                                  answer = JSON.parse(req.responseText);
                                  if (answer != null && answer.status == "OK") {
                                      address = answer.results[0].formatted_address;
                                  }
                              }
                          }
                          startObservationInputDialog(mapCenter, elevation, address);
                          
                       },
                       displayClass: 'fixmarker'});
                   fixPanel.addControls([fixButton]);
                   treeMap.addControl(fixPanel);
                   // go into recenter mode to avoid automatically shifting of map:
                   if (!recenter) {
                       recenter = true;
                       addRecenterButton();
                   }
               }
               newObservationTrigger = 0;
           }
       },
       displayClass: 'newObservationButton'
   });
   
   // add button to control panel
   panel.addControls([newObservationButton]);
   
   // add control panel to map
   treeMap.addControl(panel);
       
}

/**
 * Slippy map tilenames calculation
 */
function long2tile(lon,zoom) { 
   return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}
function lat2tile(lat,zoom)  {
   return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}
function tile2long(x,z) {
   return (x/Math.pow(2,z)*360-180);
}
function tile2lat(y,z) {
   var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
   return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}


// ZoomLevel for Caching Helper...
function getCachingZoomLevels(){
	// standard values.. all zoomlevels will be saved...
	var zStart = 18;
	var zEnd = 13;
    
	/** 
    ToDo: Add Options 	- Cache all Zoomlevel (standard ... no if)
    					- from / to Zoomlevel
    					- only actualZoomlevel
    	to Settingsmen������ 
    *//*
    if(actualZoomlevel){
    	zStart = treeMap.getZoom();
		zEnd = treeMap.getZoom();
    } else if(fromTo){
    	zStart = from;
		zEnd = to;
    }
    */
	
	return {
        'zStart': zStart,
        'zEnd': zEnd
    };
}

/**
* Calculate memory consumption for map caching 
*/
function calculateCacheMemory(bbox){
	var zoomLevels = getCachingZoomLevels();
	var OoISize = getBoundingBoxDownloadsize(bbox);
	if(OoISize > -1){
		console.log("OoISize: " + OoISize + " MB");
	} else {
		// Error getting Count from server
		console.log("Error calculating DownloadSize... " + OoISize);
		OoISize = 0;
	}
	
   var retVal = "1MB";
   var xStart = long2tile(bbox.left, zoomLevels.zStart);
   var xEnd = long2tile(bbox.right, zoomLevels.zStart);
   var yStart = lat2tile(bbox.top, zoomLevels.zStart);
   var yEnd = lat2tile(bbox.bottom, zoomLevels.zStart);
   
   console.log("BBox: coordinates: " + bbox.left + "/" + bbox.top + "/" + bbox.right + "/" + bbox.bottom);
   // ca Downloadgr������������e:
   var tileCount = 0;
   
   for(z = zoomLevels.zStart; z >= zoomLevels.zEnd; z--){
	   console.log("Tiles from: " + xStart +"/"+ yStart + " to " + xEnd +"/"+ yEnd);
       tileCount += (xEnd - xStart + 1)*(yEnd - yStart + 1);
       xStart = (xStart - (xStart%2))/2;
       xEnd = (xEnd - (xEnd%2))/2;
       yStart = (yStart - (yStart%2))/2;
       yEnd = (yEnd - (yEnd%2))/2;
       console.log("Tilecount: " + tileCount);
   }
   
   console.log("Tiles to download: " + tileCount + " (" + tileCount*0.025 + ")MB");
   var tilesSize = tileCount*0.025;
   retVal = (Math.floor((tilesSize + OoISize) * 100))/100 + " MB";
   
   return {
	   'retVal': retVal,
	   'tileCount': tileCount
   };
}

/**
* Downloads map-tiles 
*/
function downloadTile(remoteFile, finished){
	//remoteFile = "http://tile.openstreetmap.org/15/16370/10896.png";
	var localFileName = remoteFile.replace('http://tile.openstreetmap.org/', '');
	localFileName = sdCardPath + "/" + "EnvirofiMaptiles/" + localFileName.replace(/\//g,'_');
	
	console.log("save to: " + localFileName);
	
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0, 
		function(fileSystem) {
			fileSystem.root.getDirectory(
					sdCardPath + "/" + "EnvirofiMaptiles",
				{create: true, exclusive: false},
				function (entry){fileSystem.root.getFile(
					localFileName, 
					{create: true, exclusive: false},
					function(fileEntry) {
						var localPath = fileEntry.fullPath;
						if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
							localPath = localPath.substring(7);
						}
						var ft = new FileTransfer();
						ft.download(
							remoteFile,
							localPath,
							function(entry) {
							    console.log("*** download complete: " + entry.fullPath);
							    // if no files have to be downloaded because they exist already => hide "Downloading ..."
							    if (finished == true) {
			                       var panel = Ext.getCmp('vtltabpanel');
//		                    	   panel.setMasked(false);
							    }
							    // add cache tile name to array cachedMapTiles:
							    console.log("new tile: " + fileEntry.name);
							    cachedMaptiles[fileEntry.name] = "true";
							},
							function(error) {console.log("error ft.download(): " + error.code);}
						);
					},
					function(error) {console.log("error fileSystem.root.getFile(): " + error.code);}
				);},                    
				function(error) {console.log("Unable to create new directory: " + error.code);}
			);  	   
		},  
		function(error) {console.log("error window.requestFileSystem(): " + error.code);}
	);
}




/**
* checks if file has been already downloaded 
*/
function getExistingTiles(){
	cachedMaptiles = new Array;
	
	window.requestFileSystem(
   		LocalFileSystem.PERSISTENT,
   		0, 
   		function(fileSystem) {
   			fileSystem.root.getDirectory(
   				sdCardPath + "/" + "EnvirofiMaptiles",
   				{create: true, exclusive: false},
   				function (dirEntry){
   					var directoryReader = dirEntry.createReader();
   					
   					directoryReader.readEntries(
						function(entries) {
							var i;
						    for (i=0; i<entries.length; i++) {
						    	cachedMaptiles[entries[i].name] = "true";
						    	console.log("added to cachedMaptiles: " + entries[i].name + " - " + cachedMaptiles[entries[i].name]);
						    }
						},
						function(error) {console.log("Unable to read directory: " + error.code);}
   					);				
   				},                    
   				function(error) {console.log("Unable to create new directory: " + error.code);}
   			);  	   
   		},  
   		function(error) {console.log("error window.requestFileSystem(): " + error.code);}
   	);
}

/**
 * Returns the number of map tiles whithin bbox which are already cached
 */
function getCachedTilesCount(bbox) {
    var cachedTiles = 0;
    if(getCurrentNetworkState() != null){
        var zoomLevels = getCachingZoomLevels();         
        var xStart = long2tile(bbox.left, zoomLevels.zStart);
        var xEnd = long2tile(bbox.right, zoomLevels.zStart);
        var yStart = lat2tile(bbox.top, zoomLevels.zStart);
        var yEnd = lat2tile(bbox.bottom, zoomLevels.zStart);
        
        for(z = zoomLevels.zStart; z >= zoomLevels.zEnd; z--){
            for(x = xStart; x <= xEnd; x++){
                for(y = yStart; y <= yEnd; y++){
                    var filename = z + "_" + x + "_" + y + ".png";
                    if (typeof(cachedMaptiles[filename]) != 'undefined' && cachedMaptiles[filename] == 'true') {
                        cachedTiles++;
                    }
                }
            }
            xStart = (xStart - (xStart%2))/2;
            xEnd = (xEnd - (xEnd%2))/2;
            yStart = (yStart - (yStart%2))/2;
            yEnd = (yEnd - (yEnd%2))/2;
        }
    }
    return cachedTiles;
}

function storeAoIDocument(bbox) {
	
	var latMean = Math.abs( (bbox.top+bbox.bottom) / 2 );
	var lonMean = Math.abs( (bbox.left+bbox.right) / 2 );
	
	var dbInfo = userDB.getDoc("userinfo");

	if(dbInfo == null) {
		Ext.Msg.alert('', "Could not retrieve user info. Aborting.");
		return;
	}
	
	var areaName = null;
//	var input = prompt("Please enter a name for the new area:", "");
	Ext.Msg.prompt("", AoINamePrompt, // AoINamePrompt is defined as global variable in vtl_meta.js
			function(buttonId, value) {
				if (buttonId == 'ok') {
					areaName = value.replace(/(\r\n|\n|\r)/gm,"");
					var repdoc = {
						"dbname": dbInfo.dbname,
					   	"type": "aoi",
					   	"active" : true,
					   	"execState" : "created",
					   	"name" : areaName,
					   	"createdBy" : "system",		// alternative: "createdBy" : "user"
					   	"timestamp" : Math.round((new Date()).getTime() / 1000), // Unix Timestamp
					   	"aoi": {
					   		"bbox" : {
						   		"type": "Feature",
						   		"geometry" : {
						   			"type" : "Polygon",
						   			"coordinates" : [
						   				[bbox.left, bbox.bottom],
						   				[bbox.right, bbox.bottom],
						   				[bbox.right, bbox.top],
						   				[bbox.left, bbox.top]
						   			]
						   		}
					   		},
					   		"center" : {
					   			"type" : "Feature",
					   			"geometry": {
							   		"type": "Point",
							       	"coordinates": [
							       		lonMean,
							           	latMean
							       ]	       
							   }
					   		}
					   }
					};
					
					if (userDB.putDoc(repdoc)) {
				        console.log("AOI: added repdoc " + JSON.stringify(repdoc));
				    } else {
				        console.log("AOI: error adding repdoc " + JSON.stringify(repdoc));
				    }
				    
				    // variable decalared in couchdb-notifications.js
				    replicationInProgress = true;
				   
				    // do not download tiles if app ins in browser mode
					if(phoneGapTarget != "browser") {
						window.setTimeout(cacheCoordinates, 3000, bbox);
					}
				}
				else {
					return;
				}
			}, 
			null, false, null, {xtype: 'textfield', value: ''});
	
/*	if(input) {
		areaName = input.replace(/(\r\n|\n|\r)/gm,"");
	} else {
		return;
	}
*/	

	
}

function showDownloadStatus() {
	
	var downloadPanel = new OpenLayers.Control.Panel({displayClass: 'downloadPanel', id: 'downloadPanel'});
	treeMap.addControl(downloadPanel);
			   
	var div = document.createElement("div");
	div.setAttribute("class", "downloadPanelStatus");
	div.setAttribute("id", "downloadPanelStatus");
			 
	var a = document.getElementById("downloadPanel");
	a.appendChild(div);
}

function removeDownloadStatus() {
	// remove download mask (initiated in treemap.js
	panel = treeMap.getControlsBy('displayClass', 'downloadPanel');
    if (panel[0] != null) {
        panel[0].destroy();
        mapMoved();
    }
}
/**
 * Caching OSM Tiles from coordinate, to coordinate
 */
function cacheCoordinates(bbox){ // zStart must be the highest zoom
	console.log("IN cacheCoordinates...");

   if(getCurrentNetworkState() != null){
//	   var memSize = calculateCacheMemory(bbox);
       var zoomLevels = getCachingZoomLevels();       	
       var xStart = long2tile(bbox.left, zoomLevels.zStart);
       var xEnd = long2tile(bbox.right, zoomLevels.zStart);
       var yStart = lat2tile(bbox.top, zoomLevels.zStart);
       var yEnd = lat2tile(bbox.bottom, zoomLevels.zStart);
       
       var runner = 0;
       var percentage = Math.round(runner/(memSize.tileCount/100));
       var tempPercentage = percentage;

       // check how many tiles have been cached already:
       var cachedTiles = getCachedTilesCount(bbox);
       // calculate how many tiles have to be downloaded:
       var downloadCount = memSize.tileCount - cachedTiles;
       
       // if no tiles have to be downloaded, the "Downloading ..." mask has to be removed from the screen:
       if (cachedTiles != 0 && memSize.tileCount == cachedTiles) {
           var panel = Ext.getCmp('vtltabpanel');
//           panel.setMasked(false);

           console.log("???  " + memSize.tileCount + "==" + cachedTiles);
       } else {
           // download missing tiles:
           var downloaded = 0;
           for(z = zoomLevels.zStart; z >= zoomLevels.zEnd; z--){
               console.log("zoom: " + z +" started...");
           
               for(x = xStart; x <= xEnd; x++){
                   for(y = yStart; y <= yEnd; y++){
                       var filename = z + "_" + x + "_" + y + ".png";
                       var osmFilename = z + "/" + x + "/" + y + ".png";
                       

                	   console.log(filename + " --> " + typeof(cachedMaptiles[filename]) + " && "+  cachedMaptiles[filename]);
                       
                       if (typeof(cachedMaptiles[filename]) != 'undefined' && cachedMaptiles[filename] == 'true') {
                    	   
                    	   
                           console.log("already cached");
                           runner++;
                	   } else {                  
                           downloaded++;
                           var finished = false;
                           if (downloaded == downloadCount) {
                               finished = true;
                           }
                    	   downloadTile("http://tile.openstreetmap.org/" + osmFilename, finished);
    	                   runner++;
    	                   percentage = Math.round((runner/memSize.tileCount)*100);
    	                   if(percentage != tempPercentage){
    	                	   console.log(percentage + "% downloaded! (" +runner+ " from " + memSize.tileCount + ")");
                               tempPercentage = percentage;
                           }
                       }
                   }
           		}
   
               console.log("zoom: " + z +" finished!");
           
               xStart = (xStart - (xStart%2))/2;
               xEnd = (xEnd - (xEnd%2))/2;
               yStart = (yStart - (yStart%2))/2;
               yEnd = (yEnd - (yEnd%2))/2;
           }
       }
              
       console.log("finished!");      
   }
}

/**
 * delete OSM Tiles from coordinate, to coordinate
 */
function deleteCachedTiles(bbox){ // zStart must be the highest zoom
	
    var zoomLevels = getCachingZoomLevels();         
    var xStart = long2tile(bbox.left, zoomLevels.zStart);
    var xEnd = long2tile(bbox.right, zoomLevels.zStart);
    var yStart = lat2tile(bbox.top, zoomLevels.zStart);
    var yEnd = lat2tile(bbox.bottom, zoomLevels.zStart);
    
    
    window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0, 
		function(fileSystem) {
    		fileSystem.root.getDirectory(
		sdCardPath + "/" + "EnvirofiMaptiles",
		{create: true, exclusive: false},
			function (dirEntry){
				for(z = zoomLevels.zStart; z >= zoomLevels.zEnd; z--){
			        for(x = xStart; x <= xEnd; x++){
			            for(y = yStart; y <= yEnd; y++){
			                var filename = z + "_" + x + "_" + y + ".png";
			                
			                
			                dirEntry.getFile(
	        	   				filename, 
	        	   				{create: false}, 
	        	   				function(fileEntry) {
		        	   				fileEntry.remove(
		        	   					function(entry) {
   						        			cachedMaptiles[name] = "false";
		        	   						console.log(filename + " removed successful!");
	        	   						},
	        	   						function(error) {
	        	   						    Ext.Msg.alert('', 'Error removing file: ' + error.code);
	        	   						}
		    	   					);				
		    	   				},                    
		    	   				function(error) {
	        	   					console.log("Unable to locate file: " + error.code);
	        	   				}
	        	   			); 
			            	
			            }
			        }
			        xStart = (xStart - (xStart%2))/2;
			        xEnd = (xEnd - (xEnd%2))/2;
			        yStart = (yStart - (yStart%2))/2;
			        yEnd = (yEnd - (yEnd%2))/2;
			    }

				getExistingTiles();
			},                    
			function(error) {console.log("Unable to create new directory: " + error.code);}
    		);
		}
	);
}

/** 
 * Calculate lower left and upper right geo coordinates of the caching box frame
 */
function getCacheBox() {
    var cacheBox ={
        left: null,
        bottom: null,
        right: null,
        top: null
    };
    var size = treeMap.getSize();
    var margin = 30;
    var topLeft;
    var bottomRight;
    if (currentMap == 'WMS') {
    	topLeft = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(margin, margin));
    	bottomRight = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(size.w - margin, size.h - margin));
    } else if (currentMap == 'OSM') {
    	topLeft = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(margin, margin)).transform(toSMProjection, fromProjection);
    	bottomRight = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(size.w - margin, size.h - margin)).transform(toSMProjection, fromProjection);
    } else if (currentMap == 'WMTS') {
    	topLeft = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(margin, margin)).transform(toWMTSProjection, fromProjection);
    	bottomRight = treeMap.getLonLatFromPixel(new OpenLayers.Pixel(size.w - margin, size.h - margin)).transform(toWMTSProjection, fromProjection);
    }
    cacheBox = {
            left: topLeft.lon,
            top: topLeft.lat,
            right: bottomRight.lon,
            bottom: bottomRight.lat
        };
    return cacheBox;
}

/**
 * Update status line showing memory consumtion in map caching mode
 */
function setCacheStatus() {
	var zoomLevel = treeMap.getZoom();
    // get estimatd memory consumption and write it into status line:
    var element = document.getElementById("memPanel");
    var out = "Zoom Level: " + zoomLevel;
    // get memory consumption:
    cacheBox = getCacheBox();
    memSize = calculateCacheMemory(cacheBox);
    
    out += "; Estimated memory consumption: " + memSize.retVal;
    element.innerHTML = out;
}

/**
 * Event listener for zoomend event when in map caching mode
 * @param event
 */
function newCacheBox(event) {
    // get coordinates on bboxPanel edges:
    setCacheStatus(); 
}

/**
 * Remove cache box frame and controls from map
 */
function stopCacheBoxEditing() {
    // destroy panels and buttons:
    var panel = treeMap.getControlsBy('displayClass', 'outerAreaTop');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'outerAreaBottom');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'outerAreaLeft');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'outerAreaRight');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'cancelButtonControlPanel');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'saveButtonControlPanel');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'bboxPanel');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    panel = treeMap.getControlsBy('displayClass', 'memoryPanel');
    if (panel[0] != null) {
        panel[0].destroy();
    }
    // unregister event handler for zoom end events on map:
    treeMap.events.unregister('zoomend', null, newCacheBox);
}

/**
 * @brief Add a button on the lower left corner of the map to start entering a new Bounding Box.
 * A rectangle is displayed at the map. On zoom events newBbox() is called. 
 */
function addCacheBoxButton() {

   // create new panel
   var panel = new OpenLayers.Control.Panel({displayClass: 'bboxButtonControlPanel'});
   
   // create button
   var bboxButton = new OpenLayers.Control.Button({
       trigger: function() {
           if (treeMap != null) {
               // go into recenter mode:
               if (!recenter) {
                   recenter = true;
                   addRecenterButton();
               }
               // create grey area outside of cache box frame:
               treeMap.addControl(new OpenLayers.Control.Panel({displayClass: 'outerAreaTop'}));
               treeMap.addControl(new OpenLayers.Control.Panel({displayClass: 'outerAreaBottom'}));
               treeMap.addControl(new OpenLayers.Control.Panel({displayClass: 'outerAreaLeft'}));
               treeMap.addControl(new OpenLayers.Control.Panel({displayClass: 'outerAreaRight'}));
               
               // create cancel and save buttons:
               var cancelPanel = new OpenLayers.Control.Panel({displayClass: 'cancelButtonControlPanel', id: "CancelPnl"});
               var cancelButton = new OpenLayers.Control.Button({
                   trigger: function() {
                       console.log("cancel");
                       stopCacheBoxEditing();
                   },
                   displayClass: 'cancelButton'
               });
               cancelPanel.addControls([cancelButton]);
               var savePanel = new OpenLayers.Control.Panel({displayClass: 'saveButtonControlPanel', id: "SavePnl"});

               var saveButton = new OpenLayers.Control.Button({
                   trigger: function() {
                	   var cacheBox = getCacheBox();
//                	   var memSize = calculateCacheMemory(cacheBox);
                	    
                	   Ext.Msg.confirm('', getCachingWarningText() + " " + memSize.retVal, function(buttonId, value, opt) {
	               			if (buttonId == 'yes') {
	                            //cacheCoordinates(cacheBox);
	               				storeAoIDocument(cacheBox);
	               			} 
	                        stopCacheBoxEditing();
	               		});
                   },
                   displayClass: 'saveButton'
               });
               savePanel.addControls([saveButton]);
               treeMap.addControl(cancelPanel);
               treeMap.addControl(savePanel);
               // set button labels:
               var element = document.getElementById("CancelPnl");
               element.childNodes[0].textContent = cancelString; // cancelString is defined in vtl_meta.js!
               element = document.getElementById("SavePnl");
               element.childNodes[0].textContent = saveString; // saveString is defined in vtl_meta.js!
               // create cache box frame:
               var bboxPanel = new OpenLayers.Control.Panel({displayClass: 'bboxPanel'});
               treeMap.addControl(bboxPanel);
               // create status line to display memory consumption:
               var memoryPanel = new OpenLayers.Control.Panel({displayClass: 'memoryPanel', id: 'memPanel'});
               treeMap.addControl(memoryPanel);
               // register event handler for zoom end events on map:
               treeMap.events.register('zoomend', null, newCacheBox);
               // display memory consumption in status panel:
               setCacheStatus();
           }
       },
       displayClass: 'bboxButton'
   });
  
   // add button to control panel
   panel.addControls([bboxButton]);
   
   // add control panel to map
   treeMap.addControl(panel);
       
}

/**
  * @brief Adds a center pin at the given location to the current map if treeMap is defined.
  * @param[in] lon GPS longitude coordinate of current position.
  * @param[in] lat GPS latitude coordinate of current position.
  */
function updateCenterPin(lon, lat) {	
	// only add a pin if the map has already been created
	if (treeMap != null) {
		
		var size = new OpenLayers.Size(20,20);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		var icon = new OpenLayers.Icon('img/marker.png', size, offset);
		
		// TODO: remove next line!
		var markers = treeMap.getLayersByName( 'treeLayer' )[0];
		var mapCenter;
		
		// remove old markers
		var oldMarkers = treeMap.getLayersByName( 'treeLayer' );
		for (var i = 0; i < oldMarkers.length; ++i) {
			oldMarkers[i].destroy();
		}
		
		var markers = new OpenLayers.Layer.Markers( 'treeLayer' );
		treeMap.addLayer(markers);

		// add center pin to current map
        var centerPosition = new OpenLayers.LonLat(lon,lat);
		if (currentMap == 'OSM') {
		    centerPosition = new OpenLayers.LonLat(lon,lat).transform(fromProjection, toSMProjection);
		} else if (currentMap == 'WMTS') {
		    centerPosition = new OpenLayers.LonLat(lon,lat).transform(fromProjection, toWMTSProjection);
		}
        	
		mapCenter = new OpenLayers.Marker(centerPosition, icon);
		markers.addMarker(mapCenter);
		
		addRecenterButton();     
        
	}

}

/**
  * @brief Displays the given bounding box on the current map. Only for debugging purposes.
  * @param[in] bbox A bounding box object containing the boundaries of the box.
  */
function showBBox(bbox) {

	// only execute if map has been created
	if (treeMap != null) {
	
		// destroy box layer if it has been created
		var box = treeMap.getLayersByName( "Boxes" );
		if (box.length > 0) {
			box[0].destroy();
		}
		
		// create new boxes layer and add it to current map
		box = new OpenLayers.Layer.Boxes( "Boxes" );
		treeMap.addLayer(box);
		
		// create boundaries for the box based on the given bounding box and the current map type
		var bboxBoundaries;
		if (currentMap == 'WMS') {
			bboxBoundaries = new OpenLayers.Bounds(bbox.left, bbox.bottom, bbox.right, bbox.top);
		} else if (currentMap == 'OSM') {
			bboxBoundaries = new OpenLayers.Bounds(bbox.left, bbox.bottom, bbox.right, bbox.top).transform(fromProjection, toSMProjection);
		} else if (currentMap == 'WMTS') {
			bboxBoundaries = new OpenLayers.Bounds(bbox.left, bbox.bottom, bbox.right, bbox.top).transform(fromProjection, toWMTSProjection);
		}
		
		// create box marker and add it to box layer
		var bboxMarker = new OpenLayers.Marker.Box(bboxBoundaries);
		box.addMarker(bboxMarker);
	}
}

/**
 * @brief Pushes a new Sencha Touch container on the main navigation view which displays the details of the
 *        current tree.
 * @param[in] treeData Object representing all details of the tree of interest.
 */
function displayTreeDetails(treeData) {

	
	console.log("CHANGE treedata: " + JSON.stringify(treeData));
	console.log("inMainNavigation = " + menuState);
   var mainpanel = Ext.getCmp('vtlmainnavigation');

   mainpanel.push({
       xtype: 'treedetail',
       data: treeData
   });
}

/**
 * @depricated
 * @brief Add a new tree marker to the given layer.
 * @param[in] markers The layer to which the new marker will be added
 * @param[in] treeFields A description of the treeData data structure.
 * @param[in] treeData A JSON object containing all data of the current tree.
 * @param[in] imgPath Path to the icon which will be displayed.
 * @param[in] callBack Callback function which shall be called on a touch event.
 */
function addTree(markers, treeFields, treeData, imgPath, callBack) {
	
	// depricated
	return;
	
   var size = new OpenLayers.Size(30,30);
   var offset = new OpenLayers.Pixel(-(size.w/2), -(size.h-5));
   // create new tree icon with given size and given offset
   var icon = new OpenLayers.Icon(imgPath, size, offset);
   var newTree;
   
   // add tree marker to map based on the current map type
   if (currentMap == 'WMS') {
       newTree = new OpenLayers.Marker(new OpenLayers.LonLat(treeData.lon,treeData.lat),icon);
   } else if (currentMap == 'OSM') {
       newTree = new OpenLayers.Marker(new OpenLayers.LonLat(treeData.lon,treeData.lat).transform(fromProjection, toSMProjection),icon);
   } else if (currentMap == 'WMTS') {
       newTree = new OpenLayers.Marker(new OpenLayers.LonLat(treeData.lon,treeData.lat).transform(fromProjection, toWMTSProjection),icon);
   }
   
   // register click or touchend event - one for browser debugging and one for touch screen
   if ((typeof(device) != 'undefined')) {
       newTree.events.registerPriority('touchend', newTree, function() {callBack(treeData);}, false);
   } else {
       newTree.events.registerPriority('click', newTree, function() {callBack(treeData);}, false);
   }
   
   // add tree marker to given marker layer
   markers.addMarker(newTree);

}

/**
  * @brief Updates the markers of the current map if new trees have been saved to the tree store.
  * @param[in] storeID A string with the name of the currently used store.
  * @param[in] LayerName Name of the Layer on which the icons will be added.
  */
function updateTreeMap(storeID, LayerName) {
	
	console.log("(3) update tree map");
	
	if (treeMap != null) {

		// get all currently loaded trees
		var store = Ext.data.StoreManager.lookup(storeID);
		var fields = store.getFields();
		
		console.log("objects fetched: " + store.getCount());
		
		if(store.getCount() < 1) {
			console.log("No objects in local db!");
			return;
		}

		features = [];
		// add trees or user observations to current map
		for (i = 0; i < store.getCount(); i++) {
            var provider = store.getAt(i).getData(true).provider;
	        var icon = 'img/tree-icon-user_neu.png';
	        for (var j = 0, item; item = publicProviders[j]; j++) {
	            if (item == provider) {
	               icon = 'img/tree-icon_neu.png';
	            } 
	        }

			var lat = store.getAt(i).getData(true).lat;
			var lon = store.getAt(i).getData(true).lon;
			
		    var lonlat = new OpenLayers.LonLat(lon, lat);
		    if (currentMap == 'OSM') {
		    	lonlat.transform(fromProjection, toSMProjection);
		    } else if (currentMap == 'WMTS') {
		    	lonlat.transform(fromProjection, toWMTSProjection);
		    }
			
		    var treeData = store.getAt(i).getData(true);
		    
		    var f = new OpenLayers.Feature.Vector( 
		    	new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
		    	{
		    		iconPath : icon,
		    		//onClickCallback : displayTreeDetails,
		    		onClickCallback: getTreedata,
		    		data : treeData,
		    	},
		    	{
		    		externalGraphic: icon,
				    graphicWidth: 30,
				    graphicHeight: 30,
				    graphicXOffset: -15,
				    graphicYOffset: -25,
				    graphicOpacity: 1	    		
		    	}
		    );

		    features.push(f);
		}
		
		console.log("pushing " + store.getCount() + " objects from store to cluster map ...");
		var zoom = treeMap.getZoom();
		if (zoom > maxClusteringZoom) {
			if (treeMap.getLayersByName("Clusters").length > 0) {
				console.log("remove clusters");
				treeMap.removeLayer(clusters);
				activateNoClusterLayer();
			}
			noclusters.removeFeatures(noclusters.features);
	    	noclusters.addFeatures(features);
		}
		else {
			if (treeMap.getLayersByName("NoClusters").length > 0) {
				console.log("remove noclusters");
				treeMap.removeLayer(noclusters);
				activateClusterLayer();
			}
			clusters.removeFeatures(clusters.features);
	    	clusters.addFeatures(features);
		}
	}
}

/**
 * called via openlayers event listener everytime the map is moved. 
 * adds recenter button and loads objects for current map extent
 */
function mapMoved() {
	addRecenterButton();
	
	var bbox = getMapExtent();
    updateTreeStore(bbox);
}

/**
 * @brief Display the layer with clusters on the treeMap
 */
function activateClusterLayer() {
    var selectCtrl = new OpenLayers.Control.SelectFeature(
        clusters, {
            eventListeners: {
                featurehighlighted: zoomtocluster
            }
        }
    );

    console.log("selectCtrl ");
    
    treeMap.addControl(selectCtrl);
    console.log("addControl ");
    selectCtrl.activate();
    console.log("activate ");
    treeMap.addLayer(clusters);
}


/**
 * @brief Event callback for select of a single feature on the not clustered map layer
 */
function featureSelected(event) {
	var data = event.feature.attributes.data;
	console.log("DATA: " + JSON.stringify(data));
	event.feature.attributes.onClickCallback(data);
}

/**
 * @brief Display the layer with no clusters on the treeMap
 */
function activateNoClusterLayer() {
    var selectCtrl = new OpenLayers.Control.SelectFeature(
        noclusters, {
            eventListeners: {
                featurehighlighted: featureSelected
            }
        }
    );

    console.log("selectCtrl ");
    
    treeMap.addControl(selectCtrl);
    console.log("addControl ");
    selectCtrl.activate();
    console.log("activate ");
    treeMap.addLayer(noclusters);
}

/**
 * @brief Creates an OpenLayers map in the specified layer and adds tree markers for all
 *        trees saved in the given store. Moreover, a center pin is set to the current position.
 * @param[in] mapID A string representing the id of the HTML div layer used for OpenLayers.
 * @param[in] storeID A string with the name of the currently used store.
 */
function showTreeMap(mapID, storeID, onlineTilesInput, aoiDocument, treeDetailsId) {
	console.log("showTreeMap: onlineTilesInput = " + onlineTilesInput);
	if(onlineTilesInput == null){
		if(onlineTiles == null){
			onlineTilesInput = -1;
			onlineTiles = 0;
		} else {
			onlineTilesInput = onlineTiles;
		}
	}
	console.log("online Tiles: " + onlineTiles);
	console.log("online Tiles Input: " + onlineTilesInput);
		
	console.log("sdcardpath: " + sdCardPath);
	osmURLoffline = "file://" + sdCardPath + "/EnvirofiMaptiles";
	
	console.log("(1) showTreeMap");

	features = [];
	
   // do nothing in case we cannot find the specified div layer
   if (document.getElementById(mapID) == undefined) {
		console.error("No div with id " + mapID + " defined!");
       return;
   }
   
   // we have to redraw the map if the global application settings
   // have been changed
   if (currentMap != appSettings.mapSource || onlineTilesInput != onlineTiles) {
	   if(onlineTilesInput != onlineTiles){
		   recenter = true;
	   }
	   onlineTiles = onlineTilesInput;

	   
	   
       console.log("(2) showTreeMap");
       // update the current map to be equal to the map source of 
       // the global settings
       currentMap = appSettings.mapSource;
       var options;
       var defaults;
       
       // if the user has specified a WMS map, restrict zooming levels and define 
       // a useful scaling
       if (appSettings.mapSource == 'WMS') {
    	   maxClusteringZoom = 9;   
           options = {maxScale: 10000, 
               minScale: 1000,
               numZoomLevels: 11,
               fractionalZoom: true,
               theme: null,
               controls: [
                   new OpenLayers.Control.TouchNavigation({
                       dragPanOptions: {
                           enableKinetic: true
                       }
                   }),
                   new OpenLayers.Control.Zoom()
               ],
               eventListeners: {
                   "moveend": mapMoved
               }
           };
       } else if (appSettings.mapSource == 'OSM') {
    	   maxClusteringZoom = 4;          
           // we do not need any special options for maps using OSM tiles
           options = { 
               controls: [
                   new OpenLayers.Control.TouchNavigation({
                       dragPanOptions: {
                           enableKinetic: true
                       }
                   }),
                   new OpenLayers.Control.Zoom()
                   //new OpenLayers.Control.LayerSwitcher()
                   //new OpenLayers.Control.Zoom()
                   //new OpenLayers.Control.Navigation(),
                   //new OpenLayers.Control.ZoomBar()
                   //new OpenLayers.Control.Attribution(),
                   //OpenLayers.Control.ZoomIn
               ],
               eventListeners: {
                   "moveend": mapMoved
               }
           };
       } else if (appSettings.mapSource == 'WMTS') {
    	   maxClusteringZoom = 18;
           options = {
               theme: null,
               projection: "EPSG:3857",
               units: "m",
               maxResolution: 156543.0339,
               numZoomLevels: 20,
               controls: [
                   new OpenLayers.Control.TouchNavigation({
                       dragPanOptions: {
                           enableKinetic: true
                       }
                   }),
                   new OpenLayers.Control.Zoom()
               ],
               eventListeners: {
                   "moveend": mapMoved
               }
           };
           
           var extent = new OpenLayers.Bounds(1799448.394855, 6124949.74777, 1848250.442089, 6162571.828177);
           //var extent = new OpenLayers.Bounds(16.200, 48.118, 16.546, 48.325).transform(fromProjection, toProjection);

           defaults = {
               requestEncoding: "REST",
               matrixSet: "google3857",
               tileFullExtent: extent,
               attribution: 'Datenquelle: Stadt Wien - <a href="http://data.wien.gv.at">data.wien.gv.at</a>'
           };

       }
       
       // if we have to redraw the map, destroy the old map first
       // in case it exists
       if (treeMap != null) {
           treeMap.destroy();
       }
       
       // create a new map and save the object to global variable
       treeMap = new OpenLayers.Map(mapID, options);
       var Layer;
       // initialize the tile layer depending on the current map settings:
       // Tuscany vs OSM
       if (currentMap == 'WMS') {
           Layer = new OpenLayers.Layer.WMS( "web.rete.toscana.it - otf10k10",
                   wmsURL, {layers: wmsLayer});
           tileSize = new OpenLayers.Size(500, 500);
           Layer.setTileSize(tileSize);
       } else if (currentMap == 'OSM') {
    	   if(hasInternetConnection()){
    		   if (onlineTiles == 1) {
	 				console.log("(3) showTreeMap");
					Layer = new OpenLayers.Layer.OSM(
						"Open Street Map",
						osmURL + "/${z}/${x}/${y}.png",
						{zoomOffset: 13, resolutions: [19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674195,0.597164283370973]}
					);
	 			} else {
	 				console.log("(4) showTreeMap: " + osmURLoffline);
	 				Layer = new OpenLayers.Layer.OSM(
	 		               "Open Street Map",
	 		               osmURLoffline + "/${z}_${x}_${y}.png",
	 		               {zoomOffset: 13, resolutions: [19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674195,0.597164283370973]}
	 		           );
 	 			}
    	   } else {
    		   // info dass man offline ist
    		   
    	       console.log("(5) showTreeMap: " + osmURLoffline);
    		   Layer = new OpenLayers.Layer.OSM(
	               "Open Street Map",
	               osmURLoffline + "/${z}_${x}_${y}.png",
	               {zoomOffset: 13, resolutions: [19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674195,0.597164283370973]}
	           );
    	   }
       } else if (currentMap == 'WMTS') {
           Layer = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
               url: "http://www.wien.gv.at/wmts/lb/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
               layer: "lb",
               style: "farbe",
               transitionEffect: "resize"
           },
           defaults));
       }
       
       console.log("Layer: " + Layer);
       
		// remove existing layers (if any)
       var oldMarkers = treeMap.getLayersByName( 'treeLayer' );
		for (var i = 0; i < oldMarkers.length; ++i) {
			console.log("layer " + i + ": " + oldMarkers[i].name + ", " + oldMarkers[i].id);
			oldMarkers[i].destroy();
		}
        console.log("(4.5) showTreeMap: " + osmURLoffline);
		
		var colors = {
                low: "rgb(34, 139, 34)", 
                middle: "rgb(244, 164, 96)", 
                high: "rgb(208, 32, 144)"
            };
            
            // Define three rules to style the cluster features.
            var singleRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "count",
                    value: 1
                }),
                symbolizer: {
                	externalGraphic: "${iconPath}",
				    graphicWidth: 30,
				    graphicHeight: 30,
				    graphicXOffset: -15,
				    graphicYOffset: -25,
				    graphicOpacity: 1
                }
            });
            console.log("singleRule ");
            var lowRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: "count",
                    lowerBoundary: 2,
                    upperBoundary: 10
                }),
                symbolizer: {
                    fillColor: colors.low,
                    fillOpacity: 1, 
                    strokeColor: colors.low,
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    pointRadius: 15,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 1,
                    fontSize: "12px"
                }
            });
            console.log("lowRule ");
            var middleRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: "count",
                    lowerBoundary: 11,
                    upperBoundary: 24
                }),
                symbolizer: {
                    fillColor: colors.middle,
                    fillOpacity: 1, 
                    strokeColor: colors.middle,
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    pointRadius: 20,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 1,
                    fontSize: "12px"
                }
            });
            console.log("middleRule ");
            var highRule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.GREATER_THAN,
                    property: "count",
                    value: 24
                }),
                symbolizer: {
                    fillColor: colors.high,
                    fillOpacity: 1, 
                    strokeColor: colors.high,
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    pointRadius: 30,
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 1,
                    fontSize: "12px"
                }
            });
            console.log("highRule ");
            
            // Create a Style that uses the three previous rules
            var style = new OpenLayers.Style(null, {
                rules: [singleRule, lowRule, middleRule, highRule],
                context: {
                        width: function(feature) {
                            return (feature.cluster) ? 2 : 1;
                        },
                        radius: function(feature) {
                            var pix = 2;
                            if(feature.cluster) {
                                pix = Math.min(feature.attributes.count, 7) + 2;
                            }
                            return pix;
                        },
                        iconPath : function(feature) {
                        	
                        	
                        	
                        	if(feature.cluster.length == 1) {
                        		//console.log("CHANGES: icon cluster attributes: " +JSON.stringify(feature.cluster[0].attributes));
                        		//console.log("CHANGES: icon: " + feature.cluster[0].attributes.iconPath);
                        		//console.log("CHANGES: icon cluster: " +JSON.stringify(feature.cluster[0]))
                        		return feature.cluster[0].attributes.iconPath;
                        	}
                        	
                        	
                        	return "noimagefound";
                        }
                    }
            }); 
            console.log("style ");


			strategy = new OpenLayers.Strategy.Cluster( {
				distance : 30
			});

	            console.log("strategy ");
				clusters = new OpenLayers.Layer.Vector("Clusters", {
                    strategies: [strategy],
                    styleMap: new OpenLayers.StyleMap(style),
                    renderers: ['SVG','Canvas']
                });
                
	            console.log("clusters ");
                /*
                 * clusters.events.on({
                	'click' : function(feature) {
                		console.log("feature clicked: " + JSON.stringify(feature.feature));
                	}
                })
                */
/*                var selectCtrl = new OpenLayers.Control.SelectFeature(
                    clusters, {
                        eventListeners: {
                            featurehighlighted: zoomtocluster
                        }
                    }
                );

                console.log("selectCtrl ");
                
                treeMap.addControl(selectCtrl);
                console.log("addControl ");
                selectCtrl.activate();
                console.log("activate ");
*/                
                noclusters = new OpenLayers.Layer.Vector("NoClusters", {
                    renderers: ['SVG','Canvas']
                });
                
	            console.log("noclusters ");

                var markers = new OpenLayers.Layer.Markers( 'treeLayer' );
                console.log("markers ");

               	if (treeMap.getZoom() > maxClusteringZoom) {
                	treeMap.addLayers([Layer, markers]);
                	activateNoClusterLayer();
                }
                else {
                	treeMap.addLayers([Layer, markers, clusters]); 
                	activateClusterLayer();
                }
                console.log("addlayers ");
      	
     
       
		// if AoI document is specified -> zoom to this AoI
		if(aoiDocument) {
			console.log("recenter tp AOI - " + aoiDocument);
			zoomToAoI(aoiDocument);
		
		// else: zoom to current gps location
		} else {
			console.log("recenter to current Pos");
			
			// set the map center to the current position or to the default location
			if ((appSettings.useGPS == true) && ((currentPosition.lon != null) && (currentPosition.lat != null))) {
	
				if (recenter) {
					console.log("(1) recenter to current Pos - in usegps");
					if (currentMap == 'WMTS') {
						centerMapToCoords(currentPosition.lon, currentPosition.lat, 16);
					} else {
						centerMapToCoords(currentPosition.lon, currentPosition.lat, 3);
					}
				}
				updateCenterPin(currentPosition.lon, currentPosition.lat);          
			} else {
	
				if (recenter) {
					if (currentMap == 'WMTS') {
						centerMapToCoords(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat, 16);
					} else {
						centerMapToCoords(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat, 3);
					}
				}
				updateCenterPin(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat);
			}
		}
		
		addNewObservationButton();
		addCacheBoxButton();
	
	// else: treeMap does already exist: just udpate the extent
	} else {
		if(aoiDocument) {
			zoomToAoI(aoiDocument);
		} else {
			if (recenter) {
				if ((appSettings.useGPS == true) && ((currentPosition.lon != null) && (currentPosition.lat != null))) {
					centerMapToCoords(currentPosition.lon, currentPosition.lat);                
				} else {
					centerMapToCoords(appSettings.defaultLocation.lon, appSettings.defaultLocation.lat);
				}
				//updateTreeMap(appSettings.dataSource);
			}
		}
	}
   if (treeDetailsId != undefined && treeDetailsId != null) {
	   getTreedata({
			_id: treeDetailsId
	   });
   }
}

function zoomToAoI(aoiDocument) {
	
	var bbox = {
		left : aoiDocument.aoi.bbox.geometry.coordinates[0][0],
		bottom : aoiDocument.aoi.bbox.geometry.coordinates[0][1],
		right : aoiDocument.aoi.bbox.geometry.coordinates[1][0],
		top : aoiDocument.aoi.bbox.geometry.coordinates[2][1]
	}

	var zoomtoextent = new OpenLayers.Bounds(bbox.left, bbox.bottom, bbox.right, bbox.top);
    if (currentMap == 'OSM') {
    	zoomtoextent.transform(fromProjection, toSMProjection);
    } else if (currentMap == 'WMTS') {
    	zoomtoextent.transform(fromProjection, toWMTSProjection);
    }
	

	treeMap.zoomToExtent(zoomtoextent);
	    
}


function zoomtocluster(event) {
	console.log('zoomloop');
    console.log('eventtype: ' + event.type);
    console.log('feature : ' + event.feature);
    console.log('cluster? : ' + event.feature.cluster);
    
    if(event.feature.cluster.length == 1) {
    	//console.log("no cluster: " + JSON.stringify(event.feature.cluster[0]));
    	var data = event.feature.cluster[0].attributes.data;
    	console.log("DATA: " + JSON.stringify(data));
    	event.feature.cluster[0].attributes.onClickCallback(data);
    	return;
    }
    
    var f = event.feature;
    if (f.cluster.length > 1){
        clusterpoints = [];
        for(var i = 0; i<f.cluster.length; i++){
            clusterpoints.push(f.cluster[i].geometry);
        }
        var linestring = new OpenLayers.Geometry.LineString(clusterpoints);
        treeMap.zoomToExtent(linestring.getBounds());
    }
}

function getMapExtent() {
    var mapBounds = null;
    if (treeMap != null) {
        mapBounds = treeMap.getExtent();
        // transform coordinates to WGS 84:
        if (currentMap == 'WMS') {
            mapBounds = treeMap.getExtent();
        } else if (currentMap == 'OSM') {
            mapBounds = treeMap.getExtent().transform(toSMProjection, fromProjection);
        } else if (currentMap == 'WMTS') {
            mapBounds = treeMap.getExtent().transform(toWMTSProjection, fromProjection);
        }
    }
    return mapBounds;
}
