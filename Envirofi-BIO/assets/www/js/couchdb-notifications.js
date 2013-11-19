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
  * @file js/couchdb-notifications.js
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short notification handlers for couchdb changes interface 
  */

// global variables for object download progress
var replicationInProgress = false;
var objectsTotal = null;
var objectsDownloaded = 0;
var objectsDownloadedSnapshot = 0;
var AoIDocId = null;

// after n seconds, check the first time if any documents where replicated
var secondsBeforeCancelingIdleDownload = 12*1000;

// periodical isAlive-Check every n seconds
var secondsForIsAliveCheck = 4*1000;

/**
 * Called, whenever a document is stored to the local database.
 * @param {} doc The document stored to the database
 */
function notificationHandler(doc) {
	// do not handle deleted documents!
	if(doc._deleted) {
		return;
	}
	
	// check if document from listener is a tree and process it
	if(handleTree(doc)) {
		
		// if replication is in progress, update the download progress bar
		if(replicationInProgress) {
			
			updateDownloadProgressBar();
			
			// check if download has finshed yet
			if(objectsDownloaded >= objectsTotal) {

				quitDownload();
			}
			
		}

		return;
	} else
	
	// check if the document from listener is an area-of-interest
	if(handleAoI(doc)) {

		return;
		
	} else 
	
	if (handleMDAFEvent(doc)) {
		
		return;
		
	} else {
		
		// do nothing
		
	}
	
	
	// add more handlers here
            	
}

// -----------------------------------------------------------------------------------------

/**
 * Check if the stored document was a tree. If so, push it to the map!
 * @param {} doc representing a tree
 * @return {Boolean} tell whether the given doc was a tree object.
 */
function handleTree(doc) {
	
	// is the document a tree?
    console.log ("handleTree: doc = " + JSON.stringify(doc));
    console.log ("handleTree: treemap = " + treemap);
	if(treemap != null && doc.properties && doc.properties.treeid && doc.geometry) {

		// STEP1: push tree to map
		
		// prepare everything to add the tree to the map
		var lon = doc.geometry.coordinates[0];
		var lat = doc.geometry.coordinates[1];
		
	    var lonlat = new OpenLayers.LonLat(lon, lat);
	    lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
	    
	    // determine the icon to be used
	    var provider = doc.properties.provider;
	    var icon = 'img/tree-icon-user_neu.png';
	    for (var j = 0, item; item = publicProviders[j]; j++) {
	        if (item == provider) {
	           icon = 'img/tree-icon_neu.png';
	        } 
	    }
		
	    // create the OpenLayers vector object and attach some attributes for later use
	    var f = new OpenLayers.Feature.Vector( 
	    	new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
	    	{
	    		iconPath : icon,
	    		onClickCallback : getTreedata,
	    		data : doc
	    	}
	    );
	    
	    console.log("ADD TREE TO MAP!");
		
	    // features[] is a global variable defined in treemap.js
	    features.push(f); // add the previously created vector to the feature collection
	    
	    // update the cluster features
	    // clusters is a global variable defined in treemap.js
	    if(clusters && clusters.features != null) {
	    	clusters.removeFeatures(clusters.features);
	    	clusters.addFeatures(features);
	    	
	    	// STEP2: push tree to store (=list)
			addTreeToStore(doc);
	    }
		
		
		
		
		return true;
	} else {
		// console.log("NO TREE: " + JSON.stringify(doc));
	}
	
	// document is not a tree
	return false;
}

// -----------------------------------------------------------------------------------------

/**
 * Called whenever someone clicks on a tree, pushed by the handleTree() function.
 * getTreedata() converts the tree document to a tree representation returned by the
 * treedata list view and forwards it to the displayTreeDetails() method to show table detail view.
 * @param {} doc is the tree document from the database
 */
function getTreedata(doc) {
	
	console.log("doc: " + JSON.stringify(doc));
	// getCouchURL() is defined in main.js controller and returns local IP and PORT
	var myurl = getCouchURL() + getCouchDBDatabasename() + "/_design/main/_list/treedata/trees?key=\"" + doc._id + "\"";
	
	console.log("MYURL : " + myurl);
	
	// retrieve tree info and call displayTreeDetails()
	var response = Ext.Ajax.request({
	    url: myurl,
	    async : false,
	    success: function(response){
	    	
	    	var responseSubstring = response.responseText.substring(response.responseText.indexOf("(")+1, response.responseText.length-2);
	    	var result = JSON.parse(responseSubstring);
	    	// displayTreeDetails() is defined in treemap.js and shows the treedetails-view
	    	displayTreeDetails(result.data[0]);
	    	
	    
		},
		failure:function(response, opts){
			alert("Could not request single tree!");
		}
	
	});
}

/**
 * Called if a new is detected. Loads treedata-representation of tree-document and
 * pushes the tree into the commontree-store. The tree is then visible in the treelist.
 * @param {} doc is the tree document from the database
 */
function addTreeToStore(doc) {
	
	// getCouchURL() is defined in main.js controller and returns local IP and PORT
	var myurl = getCouchURL() + getCouchDBDatabasename() + "/_design/main/_list/treedata/trees?key=\"" + doc._id + "\"";
	
	// retrieve tree info and call displayTreeDetails()
	var response = Ext.Ajax.request({
	    url: myurl,
	    async : false,
	    success: function(response){
	    	
	    	/* do noting -> this call is syncron */
	    
		},
		failure:function(response, opts){
			alert("Could not load tree info!");
		}
	
	});

	var responseSubstring = response.responseText.substring(response.responseText.indexOf("(")+1, response.responseText.length-2);
	var result = JSON.parse(responseSubstring);
	
	console.log("TREE TO ADD: " + JSON.stringify(result.data[0]));
	
	if(result.data[0]) {
		console.log("TREE TO ADD AFTER: " + JSON.stringify(result.data[0]));
		var treeStore = Ext.data.StoreManager.lookup('commontreestore');
		treeStore.add(result.data[0]);
	}
}

// -----------------------------------------------------------------------------------------

/**
 * Checks if the given document is an area-of-interest.
 * Does different things, according to the state of the AoI.
 * @param {} doc represents the AoI document
 * @return {Boolean} tells whether the given doc was an AoI
 */
function handleAoI(doc) {
	
	// is th doc an AoI?
	if(doc.type && doc.type == "aoi") {
		
		// was the AoI just created? If yes, show download status and initiate progress checker 
		if(replicationInProgress && doc.execState && doc.execState == "created") {
			console.log("NOTLOADING: new aoi doc detected! Showing download status");
			
			// attach html divs for download progress info
			showDownloadStatus(); // defined in treemap.js
			
			// after n seconds, check the first time if any documents where replicated
			window.setTimeout("checkDownloadProgress()", secondsBeforeCancelingIdleDownload);
		
		// check if AoI document was updated by the server? does it contain the info how many documents will be replicated?
		} else if (doc.execState && doc.execState == "updated" && doc.objectCount) {
			
			// set the global variable, that tells how many documents we can expect to be replicated
			objectsTotal = doc.objectCount;
			
			// remember the AoI document id to perform an execStatus update when download finished
			AoIDocId = doc._id;
			
		} else {
			// do nuthin -> status might be "idle"
		}
		
		return true;
	}
	
	return false; // document was no area-of-interest!
}

// -----------------------------------------------------------------------------------------

/**
 * Increase the objectDownloaded counter and upadte the download status info
 */
function updateDownloadProgressBar() {
	
	// increase object download counter by 1
	objectsDownloaded++;
	console.log("DOWNLOAD PROGRESS: " + objectsDownloaded + " of " + objectsTotal);
	
	// update html div content
	var div = document.getElementById("downloadPanelStatus");
	div.innerHTML = Math.floor((objectsDownloaded/objectsTotal)*100)+ "%";
	
}

// -----------------------------------------------------------------------------------------

/**
 * This function is called every n seconds during an object download process.
 * If the document counter, doesn't increase between two consecutive calls
 * asume that the download progress crashed. In this case, remove the download 
 * mask and reset all download variables.
 */
function checkDownloadProgress() {
	
	// did the object download counter increase since last call of this function?
	if(objectsDownloaded > objectsDownloadedSnapshot) {
		
		console.log("Download progress is alive ... ");
		
		// remember the current object counter for next call
		objectsDownloadedSnapshot = objectsDownloaded;
		window.setTimeout("checkDownloadProgress()", secondsForIsAliveCheck);
		
	} else {
		console.log("Download progress finished or crashed!! Stopping all activities!")
		quitDownload();
	}
}

// -----------------------------------------------------------------------------------------

/**
 * Called after download finished/crashed.
 * Removes all download masks and resets global variables for next download session.
 */
function quitDownload() {
	
	// remove the download status html divs from map
	removeDownloadStatus(); // defined in treemap.js
	
    // update the execution state of the given area-of-interest
	if(AoIDocId != null) {
		var aoidoc = userDB.getDoc(AoIDocId);
		aoidoc.execState = "idle";
		userDB.putDoc(aoidoc);
	}
	
	// reset all global variables
	AoIDocId = null;
	replicationInProgress = false;
	objectsDownloaded = 0;
	objectsDownloadedSnapshot = 0;
	objectsTotal = 0;

}

// -----------------------------------------------------------------------------------------

/**
 * Checks if the given document is an area-of-interest.
 * Does different things, according to the state of the AoI.
 * @param {} doc represents the AoI document
 * @return {Boolean} tells whether the given doc was an AoI
 */
function handleMDAFEvent(doc) {
	
	if(doc.type && doc.type == "event" && !(doc.visited && doc.visited == 'true')) {
		
		var notification = {
			event : "notificationReceived",
			content : {
				type : "simpleNotification",
				text : doc.properties.label + " detected."
			}
		};
		
		GCM_catchNotification(notification);
	}
}

// -----------------------------------------------------------------------------------------

