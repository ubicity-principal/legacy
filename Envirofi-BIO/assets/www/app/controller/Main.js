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
  * @file app/controller/Main.js
  * @authors Egly, Geyer, Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short The main controller of the Sencha Touch application responsible
  *        for event handling of all Secha Touch objects.
  */

var phoneGapTarget = "phone";

/** Global state which saves the currently active view. Needed by popMainPanel(). */
var menuState = null;

/** Global Array which stores all Cached Maptiles */
var cachedMaptiles = new Array();

/** Option stores if the onlinetiles (onlineTiles == 1) or downloadedtiles (onlineTiles == 0) are used in "onlineMode" if this value changes, --> redraw map */
var onlineTiles = null;

/** Global Path of ExternStorage (SDCard!) */
var sdCardPath = "";
/** Global Path of CouchDB files */
var couchPath = "";


/** Global object saving the current settings of the application. */
var appSettings = {
	/** Default user name */
	userName: 'Unknown',
//    dataSource: 'viennatreestore',
	/** Default source of trees */
	//dataSource: 'florencetreestore',
	/** Default map source is open street map */
	mapSource: 'OSM',
	//mapSource: 'WMTS',
	/** Use GPS per default */
	useGPS: true,
	/** Standard location is the city center of Florence */
	defaultLocation: {
		//lon: 11.259409395933, // florenz
		//lat: 43.773460102012, // florenz
		//lon: 14.4441744749,	// zoebelboden
		//lat: 47.8388433545,	// zoebelboden
		lon: 16.507846992814226, // seibersdorf
		lat: 47.97620394535252, // seibersdorf
		alt: 50.0
	},
	
/*	defaultLocation: {
		lon: 16.43,
		lat: 48.16,
		alt: 180.0
	},
*/	
	publish: true,
	
	useGcm : true,
	useLocalMaps: false,
	bboxradius: 500,
	loglevel: 'error',
	mainMenuEventCount: 5
};

// accounts stored on phone for login
var loginAccounts = null;

/** checks if replication has started (normally not if there was no internet connection OR networkstate == null) */
var startedReplicationTO = false;
var startedReplicationFROM = false;

var dataSource = 'commontreestore';

/** Global image object which is needed by the tree observation form. */
var observationImage = {
    /** Contains the url where the image is stored by phonegap in the local file system. */
    url: null,
	/** Contains the base64 encoded thumbnail. */
	thumb: null,
	/** Saves the orientation (0, +/-90) of the current image. */
	orientation: null
};

/** Global object for initializing the observatio properties dialog. */
var observationInitialize = {
    location: null,
    altitude: 0.0,
    address: '',
    createTree: false
}

/** URL to local couchDB instance. Will be set by getCouchDB function. */
var couchURL = null;
var userDB = null;
var activeUser = null;
var activeDbName = null;

//var serverCouchURL = "http://envirofi.ait.ac.at/GeoCouch/";
var serverCouchURL = "http://enviro7.ait.ac.at/GeoCouch/";

// in browser mode need to add username and passwort in order to establish proper replication!
if(phoneGapTarget == "browser") {
	serverCouchURL = 'http://'+ ''+ ':' + '' + '@' + '';
}


// loaderelement and Startbutton
var portraitLoaderElement = null;
var portraitStartbtnElement = null;

// for chekcing the Device-system...
// initStartBtn()  is called (maximum) maxDeviceChecks times. (deviceChecks is the runner)
var maxDeviceChecks = 20;
var deviceChecks = 0;

var loaderMessageBox = null;

function getCouchURL() {
	return couchURL;
}

function getCouchDBDatabasename() {
	if("user" == "user"){
		activeDbName = "user";
		if(activeUser != null){
			activeDbName = "user_" + md5(activeUser);
		}
		return activeDbName;
	} else {
		activeDbName = "user";
		return activeDbName;
	}
	
	
}

/**
 * @brief 	adds an NDEF-Listener which writes an NDEF record 
 * 			with the MIME type "application/vnd.ait.envirofi.bio" 
 * 			and the treeid to a tag (after touching an NDEF tag)
 * 			Problem: the listener is not removed after writing probably due to a problem of the NFC library
 * 
 * @return
 */
function createTreeNdefRecord(){
	
	console.log("CREATE TAG STARTED");
	var treeData = Ext.getCmp('treedetail').getData();
//    Ext.getCmp('vtlmainnavigation').push({
//        xtype: 'createtagview',
//        data: treeData
//    });

    var nfcListening = true;

    Ext.Msg.alert('@treeapp.view.TreeDetail.createTagButtonLabel@',
        'Please touch an NDEF Tag with your device. Press ok when finished.',
        function (buttonId, value, opt) {
            nfcListening = false;
        }
    );
    
	nfc.addNdefListener(
		function() {
		    console.log ("nfcListening: " + nfcListening);
		    if (nfcListening == false) {return;}
			var mimeType="application/vnd.ait.envirofi.bio";
			var payload=treeData._id;
			var message=ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));			
			nfc.write(
				[message],
				function(){
					console.log("Ndef Record successfully written.");
					nfcListening = false;
                    Ext.Msg.alert('', 'NFC Tag successfully written!');
					//PROBLEM. NO RESULT AT REMOVING THE LISTENER
					nfc.removeNdefListener(
							function(){}, 
							function(){
								console.log("Ndef write listener successfully removed.");
							},
							function(){
								console.log("Removing Ndef write listener failed.");
							}
					);
				
				},
				function(){
					console.log("Writing Ndef Record failed.");
                    nfcListening = false;
                    Ext.Msg.alert('', 'Error at writing NFC Tag!');
					//PROBLEM. NO RESULT AT REMOVING THE LISTENER
					nfc.removeNdefListener(
							function(){}, 
							function(){
								console.log("Ndef write listener successfully removed.");
							},
							function(){
								console.log("Removing Ndef write listener failed.");
							}
					);
				}
			);

		},
		function(){
			console.log("Register NFC writer success.");
		},
		function(){
			console.log("Register NFC writer fail.");
            nfcListening = false;
            Ext.Msg.alert('', 'Error at writing NFC Tag!');
 		}
		);
}

/**
 * @brief   opens the gui screen for entering new observation properties
 * @return
 */
function startObservationInputDialog(location, elevation, address) {
    // open form for entering object properties:
    var newTreeForm = Ext.getCmp('vtlnewtree-form');
    
    observationInitialize.location = location;
    observationInitialize.altitude = elevation;
    observationInitialize.address = address;
    observationInitialize.createTree = true;
    
    Ext.getCmp('vtlmainnavigation').push({
        xtype: 'vtlnewtree'
    });
//    menuState = 'inReportObservation';
    menuState = 'inMainNavigation';
}

/**
 * @brief Stores the user preferences from appSettings in database.
 */
function saveUserPreferences() {
	var userPreferences = {
		_id: "userPreferences",
		mapSource: appSettings.mapSource,
		useGPS: appSettings.useGPS,
		publish: appSettings.publish,
		defaultLocation: appSettings.defaultLocation,
		useGcm : appSettings.useGcm,
		bboxradius : appSettings.bboxradius,
		loglevel: appSettings.loglevel,
		useLocalMaps: appSettings.useLocalMaps,
		mainMenuEventCount: appSettings.mainMenuEventCount
	};
	if (userDB.putDoc(userPreferences)) {
		console.log("user preferences stored successfully");
	} else {
		console.log("user preferences stored failure");
	}
}
/**
 * @brief Loads the user preferences from database and initializes appSettings
 */
function loadUserPreferences() {
    console.log("loadUserPreferences");
    var userPreferences = userDB.getDoc("userPreferences");
    if (userPreferences != null) {
        appSettings.mapSource = userPreferences.mapSource;
        appSettings.useGPS = userPreferences.useGPS;
        appSettings.publish = userPreferences.publish;
        appSettings.defaultLocation = userPreferences.defaultLocation;
        appSettings.useGcm = userPreferences.useGcm;
        appSettings.bboxradius = userPreferences.bboxradius;
        appSettings.loglevel = userPreferences.loglevel;
        appSettings.useLocalMaps = userPreferences.useLocalMaps;
        if (userPreferences.mainMenuEventCount != undefined) {
        	appSettings.mainMenuEventCount = userPreferences.mainMenuEventCount;
        }
    }
    if (appSettings.useGPS == false) {
        pauseGeoLocation();
        
       currentPosition.lon = appSettings.defaultLocation.lon;
       currentPosition.lat = appSettings.defaultLocation.lat;
       currentPosition.alt = appSettings.defaultLocation.alt;
       updateEventStore(currentPosition);
    }
    if (appSettings.loglevel == undefined) {
    	appSettings.loglevel = 'error';
    }
}

function setUseCachedMaps(aoidoc, treeDetailsId) {
    var dontShowAgain = localStorage.getItem("useCachedMaps.dontShowAgain");
    if (dontShowAgain && dontShowAgain == '1') {
    	var useCachedMaps = 0;
    	if (appSettings.useLocalMaps == false)
    		useCachedMaps = 1;
    	Ext.getCmp('vtlmainpanel').setActiveItem(1);
		menuState = 'inMainNavigation';
        if (aoidoc != null) {
            showTreeMap("treemap", "commontreestore", useCachedMaps, aoidoc, treeDetailsId);
        }
        else {
            showTreeMap("treemap", "commontreestore", useCachedMaps, null, treeDetailsId);
        }
    } else {  
	    var msg;
	    var msgPart1 = "This application can use maps stored on the phone or download them from web. What do you prefer?<br/><br/><input type=\"radio\" id=\"local\" name=\"useCachedMaps\""; 
	    var msgPart2 = "/> Use Local Maps<br/><br/><input type=\"radio\" id=\"online\" name=\"useCachedMaps\""; 
	    var msgPart3 = '/> Download Maps<br/><br/><input type="checkbox" id="doInSettings" /> Modify in Settings';
	    var msgPartChecked = " checked=\"checked\"";
	    if (appSettings.useLocalMaps == true) {
	        msg = msgPart1 + msgPartChecked + msgPart2 + msgPart3;
	    }
	    else {
	       msg = msgPart1 + msgPart2 + msgPartChecked + msgPart3;
	    }
		var msgBox = new Ext.MessageBox().show(
			{
				message: msg,
  				buttons: Ext.MessageBox.OK,
				fn: function(buttonId) {
					Ext.getCmp('vtlmainpanel').setActiveItem(1);
					menuState = 'inMainNavigation';
		            if (document.getElementById('local').checked) { 
		                appSettings.useLocalMaps = true;
		                if (aoidoc != null) {
		                    showTreeMap("treemap", "commontreestore", 0, aoidoc, treeDetailsId);
		                }
		                else {
		                    showTreeMap("treemap", "commontreestore", 0, null, treeDetailsId);
		                }
		            }
		            else if (document.getElementById('online').checked) {
		                appSettings.useLocalMaps = false;
		                if (aoidoc != null) {
		                    showTreeMap("treemap", "commontreestore", 1, aoidoc, treeDetailsId);
		                }
		                else {
		                    showTreeMap("treemap", "commontreestore", 1, null, treeDetailsId);
		                }
		            }
	                if (document.getElementById('doInSettings').checked) { 
	                    localStorage.setItem("useCachedMaps.dontShowAgain", "1");
	                }
	                else {
	                    localStorage.setItem("useCachedMaps.dontShowAgain", "0");
	                }
		            msgBox.destroy();
 				}
			}
		);

    }
}

function GCM_catchNotification(notification) {
	
	if(notification.event == "notificationReceived") {
		
		navigator.notification.beep(1);
		navigator.notification.vibrate(2000);
		
		if(notification.content.type == "demoNotification" || notification.content.type == "simpleNotification") {
			
			window.GCM.notify(notification.content.text, 
	    								function() { console.log("GCMPlugin successfully handled notification!");}, 
	    								function() { console.log("GCMPlugin could not handle notification!");} 
	    							);
		}
		updateEventStore();
		
	}
}

function GCM_RegistrationChange(e) {
	
	if(e.event == "registrationChange") {
		var channelData = {
			"name": "gcm",
			"enabled" : (e.regStatus == "on"),
			"properties" : {
				"registrationId" : e.regId
			}
		};
		
		NOT_addChannel(channelData);  
	}
	
}

function NOT_addChannel(channelProperties) {
	
	if(userDB == null) {
		alert("Ooops! You were too fast! Try again in a few seconds!");
	}
	
	var dbInfo = userDB.getDoc("userinfo");

	if(dbInfo == null) {
		alert("Ooops! You were too fast! Try again in a few seconds!");
	}

	var notificationDocName = "n_" + dbInfo.dbname;
	var notificationDoc = userDB.getDoc(notificationDocName);
	
	if(notificationDoc == null) {
		notificationDoc = {
			"_id": notificationDocName,
			"type" : "notificationDoc",
			"dbname" : dbInfo.dbname,
			"provider" : dbInfo.provider,
			"channels" : [],
			"notifications" : []
		};
	}
	
	var channelExists = false;
	for(i=0; i<notificationDoc.channels.length; i++) {
		if(notificationDoc.channels[i].name && notificationDoc.channels[i].name == channelProperties.name) {
			notificationDoc.channels[i] = channelProperties;
			channelExists = true;
		}
	}
	
	if(!channelExists) {
		notificationDoc.channels.push(channelProperties);
	}
	
	//notificationDoc.channels[channelName] = channelProperties;

	if (userDB.putDoc(notificationDoc)) {
        console.log("notifications document stored successfully");
    } else {
        console.log("could not store notifications document!");
    }
	
}

/**
  * @brief Goes back one step in application history: When the main navigation is active, just
  *        pop an item from the stack, otherwise change to the main menu. If the function is
  *        called in the state "inMainMenu", the user is asked whether the application shall 
  *        be closed.
  */
function popMainPanel() {
	// only pop the current view if there exists another on the stack...
	if (menuState == 'inMainNavigation' && Ext.getCmp('vtlmainnavigation').getPreviousItem()) {
		Ext.getCmp('vtlmainnavigation').pop();
	} else if (menuState != 'inMainMenu') {
		Ext.getCmp('vtlmainpanel').setActiveItem(8);
		menuState = 'inMainMenu';
	} else {
		// exit app
		Ext.Msg.confirm('', 'Do you really want to quit the application?', function(buttonId, value, opt) {
			if (buttonId == 'yes') {
				navigator.app.exitApp();
			}
		});
	}
}

function getSDCardPath(){
	if(phoneGapTarget == "phone") {
		window.ExternalStorageDirectory.getPath(function(val){
			console.log("getSDCardPath");
			sdCardPath = val;
		});
	}
}

function initCouchPath(){
	if(phoneGapTarget == "phone") {
		window.ExternalStorageDirectory.getCouchPath(function(val){
			console.log("getCouchPath");
			couchPath = val.substr(0, val.lastIndexOf('/')+1) + "db";
		});
	}
}

function getCouchPath(){
	return couchPath;
}

/**
 * @brief Set the contents of the account name selection field on the 
 * 		  login screen depending on the selected account type
 */
function setAccountNames(type) {
	console.log("AccountType: " + type);
	var userAccountsJson = [];

	var index = -1;
	console.log("loginAccounts: " + JSON.stringify(loginAccounts));
	for (var j = 0; ((j < loginAccounts.length) && (index == -1)); j++) {
		if (loginAccounts[j].type == type) {
			index = j;
		}
	}
	console.log ("index: " + index);
	for (var i = 0; i < loginAccounts[index].ids.length; i++) {
		if (type != "Demo") {
			userAccountsJson.push({text: loginAccounts[index].ids[i], value: loginAccounts[index].ids[i] + '::' + type});
		}
		else {
			userAccountsJson.push({text: loginAccounts[index].ids[i], value: loginAccounts[index].ids[i]});			
		}
	}
	var loginSelect = Ext.getCmp('loginemailselect_id');
	loginSelect.setOptions(userAccountsJson);
	var lastLoginAccount = localStorage.getItem("lastLoginEmail");
	if (lastLoginAccount)
		loginSelect.setValue(lastLoginAccount);
}

/**
  * @brief Shows the loginscreen by setting the active item of the main panel to the 4th
  *        element.
  */
function showLogin() {
	Ext.getCmp('vtlmainpanel').setActiveItem(4);

	var userAccountsJson = [];

	// get accounts available on phone:
    cordova.exec(
            function(accountList) {
            	// success callback
            	console.log("Accounts: " + JSON.stringify(accountList));
            	loginAccounts = accountList;
            	for (var i = 0; i < accountList.length; i++) {
            		userAccountsJson.push({text: accountList[i].type, value: accountList[i].type});
            	}
        		console.log("userAccountsJson: " + JSON.stringify(userAccountsJson));
        		var loginType = Ext.getCmp('loginaccounttype_id');
        		loginType.setOptions(userAccountsJson);
        		var lastloginType = localStorage.getItem("lastLoginType");
            	if (lastloginType) {
            		loginType.setValue(lastloginType);
            	}
        		menuState = 'inLogin';
            },  
            function() {
                // error callback
                console.log("Error when retrieveing account list!");
            },
            'AccountList', 
            '',  
            []);   
}

/**
  * @brief Shows the registration View
  */
function showRegistration() {
	Ext.getCmp('vtlmainpanel').setActiveItem(5);
	menuState = 'inRegistration';
}

/**
  * @brief Shows a loader animation
  */
function showLoader() {
	Ext.getCmp('vtlmainpanel').setActiveItem(6);
	menuState = 'inLoader';
}


/**
  * @brief Shows the main menu by setting the active item of the main panel to the first
  *        element.
  */
function showMainMenu() {
	// set phonegap back button if we are on a device
	if (typeof(device) !== 'undefined') {
		document.addEventListener("backbutton", popMainPanel, false);
		// add event listener for menu button => show Main menu
		document.addEventListener("menubutton", showMainMenu, false);
	}
	
	// just change the active item of parent container to point to the main menu
	Ext.getCmp('vtlmainpanel').setActiveItem(8);
	menuState = 'inMainMenu';
}

/**
  * @brief Callback function in case a picture has been successfully taken. It sets the
  *        source and orientation of the global image object and displays it to the user.
  * @param[in] imageData Contains the base64 encoded string of the JPEG image.
  */
function getImage(imageUrl) {
	
    observationImage.url = imageUrl;
    var base64Thumb = "";
    cordova.exec(
            function(base64Thumb) {
                var image = document.getElementById("vtlobservationhtmlimg");
                image.src = 'data:image/jpeg;base64,' + base64Thumb;
                observationImage.thumb = base64Thumb;
            },  
            function(base64Thumb) {
                // thumb could not be created:
                var image = document.getElementById("vtlobservationhtmlimg");
                image.src = 'img/blank.png';
                observationImage.thumb = null;
            },
            'Thumbnailer', 
            'createImageThumbnail',  
            [imageUrl]);   
}

/**
  * @brief Sets source and orientation of the global image object to null and 
  *        informs the user why no image has been taken.
  * @param[in] message A string containing the error message why no image
  *            has been taken.
  */
function getNoImage(message) {
	Ext.Msg.alert('', message); 
	var image = document.getElementById("vtlobservationhtmlimg");
	image.src = 'img/blank.png';
    observationImage.url = null; 
    observationImage.thumb = null; 
	observationImage.orientation = null;
}

/**
 * @brief Calls showTreeMap() function and provides the ID of div layer of the current component
 *        and the name of the currently active tree store.
 * @param[in] component Component related to current event.
 * @param[in] eOpts The options which have been passed to the event listener.
 */
function showMap(component, eOpts) {
   showTreeMap(component.getId(), dataSource);
}

function reloadTreeStore() {
    var treeStore = Ext.data.StoreManager.lookup('commontreestore');
    if (treeStore == undefined) {
        console.log("Tree store not found!");
    }
    else {
        treeStore.load();
    }
}

/**
 * @brief Ask user for user name; call registeruser on Server
 * @param[in] component Component related to current event.
 * @param[in] eOpts The options which have been passed to the event listener.
 */
function registerUser() {
    var dbInfo;
    //var userName = prompt("Please enter a valid user name!", "");
    
    var userName = localStorage.getItem("lastLoginEmail"); 
    if (userName == null) {
        if (userDB.exists()) {
            console.log("deleted local user db " + userDB.deleteDB ());
        }
        // exit application
        navigator.app.exitApp();
        return;
    }
    
    while (userName == "") {
        console.log("user name check");
        userName = prompt("Please enter a valid user name!", "");
    }
    
    appSettings.userName = userName;
    
//  console.log ("http://enviro7.ait.ac.at/~envirofi/GeoCouchUtils/" + "registerUser.pl?" + "user=" + userName);
    var req = new XMLHttpRequest();

    req.open('GET', "http://enviro7.ait.ac.at/~envirofi/GeoCouchUtils/" + "registerUser.pl?" + "user=" + userName, false);
    req.send(null);
    if (req.readyState == 4) {

        console.log(req.responseText);
        
        dbInfo = JSON.parse(req.responseText);
        console.log(dbInfo);
        if (dbInfo == null) {
            Ext.Msg.alert('', "Creation of server instance of user db failed. Please ask server administrator.");
        }
        else { 
        	if (dbInfo.docCount > 10) {
        		// user db on server is already exisitng and has to be replicated before any other
        		// user actions can be done:
        		var docCount = dbInfo.docCount;
        		console.log("docCount: " + docCount);
        		Ext.getCmp('login-form').unmask();
        		var loaderMessageBox = new Ext.MessageBox().show(
    				{
        				message: 'Synchronizing data ...<br/><br/><progress id="progressBar" value="0" max="100"><span>0</span>%</progress>',
          				buttons: Ext.MessageBox.CANCEL,
        				fn: function(buttonId) {
        					// stop calling replication callback:
        					// setReplicationCallback(null);
        					// delete couchdb and go back ro login screen:
	        				userDB.stopNotifications();
	        				console.log("deleted local user db " + userDB.deleteDB ());
         				}
    				}
    			);
        		// replicate user db from server and show progress:
        		var docsReplicated = 0;
        		userDB.notifyChanges(null,
					function (doc) {
	    				var progressBar = document.getElementById('progressBar');
	    				var newValue = 0;
	    				docsReplicated++;
	    				console.log("UserDB doc_count: " + docsReplicated);
	    				newValue = Math.floor((docsReplicated/docCount)*100);
						console.log("Progress: " + newValue);		
	    				progressBar.value = newValue;
	    				progressBar.getElementsByTagName('span')[0].textContent = newValue;
	    				if (newValue >= 100) {
	    					// finished!
	    					userDB.stopNotifications();
	    					loaderMessageBox.destroy();
	    					var cachingMessageBox = new Ext.MessageBox().show(
    							{
    		        				message: 'Downloading Maps ...',
    		          				buttons: Ext.MessageBox.OK,
    		        				fn: function(buttonId) {
    		        					userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true);
    	    							userDB.replicateTo(serverCouchURL + dbInfo.dbname, true);
    			    		            
    			    		            console.log("Created DB and started replication!");
    	    							var loginForm = Ext.getCmp('login-form');
    		    						loginForm.setMasked({
    		    						     xtype: 'loadmask',
    		    						     zIndex: 999999
    		    						 });
    			    		            writeDocsToDb();
    			    		            finishInitialisation();	 
    		         				}
    		    				}
							);
	    	        		// get AoI-store
	    	    			var aoiStore = Ext.data.StoreManager.lookup('areaofintereststore');
	    	    			
	    	    			// did it work?
	    	    			if (aoiStore == undefined) {
	    	    			    console.log("AOI: aoiStore is undefined!");
	    	    			} else {	
	    	    				// set proxy and start loading the AoI-data to the store
	    	    				console.log("load AOoI: dbinfo = " + JSON.stringify(dbInfo));
	    	    				var proxy = getCouchURL() + getCouchDBDatabasename() + "/_design/main/_list/aoidata/aoi";
	    	    				console.log("load AOoI: url = " + proxy);
	    	    			    aoiStore.getProxy().setUrl( proxy );
	    	    			    aoiStore.load(function(records, operation, success) {
		    	    				console.log("load AOoI: in load function, success = " + success);
	    	    			    	if (success) {
		    	    				    // loop through store rows and cache map tiles
		    	    			    	for (var i = 0; i < records.length; i++) {
		    	    			    		var AoIDoc = userDB.getDoc(records[i].getData()._id);
		    	    					    if (AoIDoc != null) {
			    	    			    		console.log("Caching maps of aoi " + AoIDoc.name);
		    	    					    	var bbox = {
		    	    					    			left : AoIDoc.aoi.bbox.geometry.coordinates[0][0],
		    	    					    			bottom : AoIDoc.aoi.bbox.geometry.coordinates[0][1],
		    	    					    			right : AoIDoc.aoi.bbox.geometry.coordinates[1][0],
		    	    					    			top : AoIDoc.aoi.bbox.geometry.coordinates[2][1]
	    	    					    		}
		    	    					    	// do not download tiles if app is in browser mode
		    	    							if(phoneGapTarget != "browser") {
		    	    								cacheCoordinates(bbox);
		    	    							}
		    						    	}	    					    
		    						    }
	    	    			    	} else {
	    	    			    		Ext.Msg.alert('', "Could not load all map tiles. Please refresh tiles for your areas manually.");
	    	    			    	}
	    	    				}, this);
	    	    			}	    					
	    				}
	    			}
				);     
        		userDB.replicateFrom(serverCouchURL + dbInfo.dbname, false);
        	}
        	else {
        		// start continuous replication in both directions
        		userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true);
        		userDB.replicateTo(serverCouchURL + dbInfo.dbname, true);
        		writeDocsToDb();
        		finishInitialisation();	    
        		console.log("Created DB and started replication!");
        	}
        }
    }
    else {
        if (userDB.exists()) {
            console.log("deleted local user db " + userDB.deleteDB ());
        }
        Ext.Msg.alert('', "No connection to server available. Please start application again when you are online.");
        // exit application
        navigator.app.exitApp();
        return;
    }
}

        
function writeDocsToDb() {

	// bulk load js documents into user database
	if (userDB.exists()) {	

		var docList = new Array();
		docList.push("js/json/vocabulary.trees.de.json");
		docList.push("js/json/vocabulary.trees.it.json");
		docList.push("js/json/vocabulary.design.vocabulary.json");
	   
		// load json files and save them in storeDB
	   	for(var i=0; i<docList.length; i++) {
	   		console.log("bulk load: handling " + docList[i]);
	        Ext.Ajax.request({
			    url: docList[i],
			    success: function(response){
			        var result = JSON.parse(response.responseText);
			        if(userDB.putDoc(result)) {
			        	console.log("bulk load: successfully stored document " + response.request.options.url + " in userdb!");
			        }
			    },
			    failure:function(response, opts){
					console.log("bulk load error: could not load json document!" + response.request.options.url);
				}
	
			});
	   	}
	} else {
		console.log("bulk load: userdb does not yet exist!");
	}
}

/**
 * Gets the actual networkstate.
 */
function getCurrentNetworkState(){
    var networkState = navigator.network.connection.type;
    if (navigator.network.connection.type == Connection.NONE) {
        return null;
    }
    else {
        return 1;
    }
}

/**
 * Checking if the device is conected to the interent
 */
function hasInternetConnection(){
    if (typeof(device) !== 'undefined') {
        if(getCurrentNetworkState() != null){
           var req = new XMLHttpRequest();
           req.timeout = 200;
           
           req.open('GET', "http://enviro7.ait.ac.at", false);
           req.send(null);
           if (req.readyState == 4) {

               if(req.status == 200 || req.status == 202){
                   console.log("Internet Connection....");
                   return true;
               } else {
                   console.log("NO!!!!! Internet Connection....");
                   return false;
               }
           }
       }
        console.log("NO!!! interent connection...");
       return false;
    }
    else {
    	console.log("has internet connection...");
        return true;
    }
}


/**
  * @brief Checks if the device is ready an if so, the loader and Startbutton will be displayed. 
  *
  */
function initStartBtn(){
	if(!devReady && deviceChecks < maxDeviceChecks){
		console.log("initStartBtn()... deviceChecks-count: " + deviceChecks);
			
		deviceChecks++;
		window.setTimeout(initStartBtn,100);
	} else {
		getSDCardPath();
		console.log("Cache Directory: " + sdCardPath);
		initCouchPath();
		console.log("Couch Directory: " + couchPath);
		
		
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      
        var vtlMainPanel = Ext.getCmp('vtlmainpanel');
		
		vtlMainPanel.add([{
			xtype: 'disclaimerpanel'
		},
		{
			xtype: 'vtlmainnavigation'
		},
		{
			xtype: 'vtlnewtree'
		},
		{
			xtype: 'treeappsettings'
		},
		{
			xtype: 'loginpanel'
		},
		{
			xtype: 'registrationpanel'
		},
		{
			xtype: 'loaderpanel'
		},
		{
			xtype: 'areaofinterestnavigation'
		},
		{
            xtype: 'vtlmainmenu'	              
        }
		]);

		// Show main menu and save it in the current state variable
//		showMainMenu();
		
	    var showDisclaimer = localStorage.getItem("showDisclaimer");
	    if (showDisclaimer == null || showDisclaimer == '1') {
	        Ext.getCmp('vtlmainpanel').setActiveItem(0);
	    }
	    else {
	        showLogin();	        
	    }
	    
		// depending on the currently active tree store add a tabpanel for Vienna 
		// or Florence tree database
        Ext.getCmp('vtlmainnavigation').add([{
            xtype: 'vtltabpanel'
        }]);
		
        
	}
}

function checkLogin(userEmail, pwd){
	if(hasInternetConnection()){
	
		if(userEmail.length < 4){
			Ext.Msg.alert('', "Email must have at least 4 characters!");
			return false;
		}
			
		var returnval = -1;
		var data = "grant_type=password&client_id=9PROwQZ2cG&username="+userEmail+"&password="+pwd+"&scope=gcpcsc10000104";
		var req = null;
		req = new XMLHttpRequest();
		req.open( "POST", "https://logint2.idm.toon.sul.t-online.de/gcp-web-api/oauth?" + data, false );
		
		//Send the proper header information along with the request
		req.setRequestHeader("Accept", "application/json");
		req.setRequestHeader("Content-type", "application/x-www-formurl-encoded");
		//req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");
		
		req.onreadystatechange = function() {//Call a function when the state changes.
			if(req.readyState == 4 && req.status == 200) {
				console.log("req.readyState: ### " + req.readyState);
				console.log("req.status: ### " + req.status);
				console.log("req.responseText: ### " + req.responseText);
				
				returnval = 1;
			} else if(req.readyState == 4){
				console.log("req.readyState: ### " + req.readyState);
				console.log("req.status: ### " + req.status);
				console.log("req.responseText: ### " + req.responseText);
				
				var response = JSON.parse(req.responseText);
				Ext.Msg.alert('', response.error_description);
				
				returnval = 0;
			}
		}
		req.send(null);
		
		return returnval;
	} else {
		Ext.Msg.alert('', "No connection to server available. Please start application again when you are online.");
		return -1;
	}
}

function checkRegistration(email, pwd, pwdConf){
	/*
	console.log("email: " + email);
	console.log("pwd: " + pwd);
	console.log("pwdConf: " + pwdConf);
	
	var errors = new Array();
	if(email.length < 8){
		errors.push("email to short");
	}
	if(pwd == ""){
		errors.push("no password");
	} else if(pwd.length < 5){
		errors.push("password to short");
	}
	if(pwd != pwdConf){
		errors.push("wrong Password");
	}
		
	if(errors.length != 0){
		for(var i = 0; i < errors.length; i++){
			alert(errors[i]);
		}
		return false;
	}
	*/
	var data = new Object(); 
	data.dienstId = "gcpcsc10000104";
	data.email = "gaming@thehu.at";
	data.password = "tester";
	data.name = "Markus";
	data.surname = "HU";
	data.userLanguage="de";
	data.salutation="MR";
	data.mandantAgreement = "true";
	data.dienstAgreement = "false";
	

	var jsondata = JSON.stringify(data);
	// &
	console.log(jsondata);
	
	var returnval = -1;
	var data = "";
	var req = null;
	req = new XMLHttpRequest();
	//req.open( "POST", "https://logint2.idm.toon.sul.t-online.de/gcp-web-csc/register?dienstId=gcpcsc10000104&email=mc@thehu.at&password=tester&name=Markus&surname=HU&userLanguage=de&salutation=MR&mandantAgreement=true&dienstAgreement=false" + data, false );
	
	// testing other methods:
	// registration:
	req.open( "POST", "https://logint2.idm.toon.sul.t-online.de/gcp-web-csc/10000104/registration/register", false );
	/*
	if(email == ""){
		req.open( "GET", "https://logint2.idm.toon.sul.t-online.de/gcp-web-csc/10000104/registration/status?dienstId=gcpcsc10000104&email=mc@thehu.at", false );
	} else {
		req.open( "GET", "https://logint2.idm.toon.sul.t-online.de/gcp-web-api/10000104/registration/status?dienstId=gcpcsc10000104&email=gaming@thehu.at", false );
	}
	*/
	// password change:
	
	
	//Send the proper header information along with the request
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Content-type", "application/x-www-formurl-encoded");
	//req.setRequestHeader("Content-length", params.length);
	req.setRequestHeader("Connection", "close");
	
	req.onreadystatechange = function() {//Call a function when the state changes.
		if(req.readyState == 4 && req.status == 200) {
			console.log("req.readyState: ### " + req.readyState);
			console.log("req.status: ### " + req.status);
			console.log("req.responseText: ### " + req.responseText);
			
			returnval = 1;
		} else if(req.readyState == 4){
			console.log("req.readyState: ### " + req.readyState);
			console.log("req.status: ### " + req.status);
			console.log("req.responseText: ### " + req.responseText);
			
			var response = JSON.parse(req.responseText);
			console.log("error");
			Ext.Msg.alert('', response.error_description);
			returnval = 0;
		}
	}
	
	console.log("request.send()...");
	
	req.send(jsondata);
	
	return returnval;
}


//is called when the user successful logged in
function loginSuccess(userEmail, userAccountType){
	// save successful email in appstorage.
	console.log("ActiveUser: " + userEmail);
	activeUser = userEmail;
	localStorage.setItem("lastLoginEmail", userEmail);
	localStorage.setItem("lastLoginType", userAccountType);
//	localStorage.setItem("rememberPassword_" + md5(userEmail), rememberPwd);
//	
//
//    
//    var userAccountsStr = localStorage.getItem("userAccounts");
//    if(-1 == userAccountsStr.indexOf(userEmail)){
//    	var userAccountsJson = JSON.parse(userAccountsStr);
//		userAccountsJson.push({text: userEmail,value: userEmail});
//        localStorage.setItem("userAccounts", JSON.stringify(userAccountsJson));
//    }
//	
//	
//	if(rememberPwd == true){
//		localStorage.setItem("password_" + md5(userEmail), userPwd);
//	} else {
//		localStorage.setItem("password_" + md5(userEmail), "");
//	}
	
	// initialize bbox and treestore
	var bbox = {
         left: appSettings.defaultLocation.lon - 0.005,
         bottom: appSettings.defaultLocation.lat - 0.005,
         right: appSettings.defaultLocation.lon + 0.005,
         top: appSettings.defaultLocation.lat + 0.005
     };
             
     // calculate bbox from current position
     if (currentPosition.lon != null && currentPosition.lat != null) {
         bbox.left = currentPosition.lon - 0.005;
         bbox.bottom = currentPosition.lat - 0.005;
         bbox.right = currentPosition.lon + 0.005;
         bbox.top = currentPosition.lat + 0.005;
     }
     
	//showLoader();
	var loginForm = Ext.getCmp('login-form');
	loginForm.setMasked({
	     xtype: 'loadmask',
	//        message: 'Downloading ...',
	     zIndex: 999999
	 });
	
	//showMainMenu();
	getCouchDB();
}

//is called when the user successful has een registered 
function registrationSuccess(userEmail){
	Ext.getCmp('registrationemail_id').hide();
	Ext.getCmp('registrationpwd_id').hide();
	Ext.getCmp('registrationpwd_id_confirm').hide();
	Ext.getCmp('registration_btn').hide();
	
	// if registration is successfull, the user has to confirm the registration email 
	// and after that the user can try to login
	
	// SHOW THE USER THE MESSAGE TO READ HIS EMAIL AN CONFIRM THE REGISTRATION MAIL
	Ext.getCmp('registrationSuccessTxt').setHtml("<h3>" + 'Thank you for your registration! Please confirm the registration-email sent to' + ": " + userEmail + '' + "</h3><h4>" + 'Your Envirofi-team!' + "</h4>");
	Ext.getCmp('registrationSuccessTxt').show();
}


//is called when the user wants to stay offline
function skipLogin(){
	// initialize bbox and treestore
    var bbox = {
        left: appSettings.defaultLocation.lon - 0.005,
        bottom: appSettings.defaultLocation.lat - 0.005,
        right: appSettings.defaultLocation.lon + 0.005,
        top: appSettings.defaultLocation.lat + 0.005
    };
            
    // calculate bbox from current position
    if (currentPosition.lon != null && currentPosition.lat != null) {
        bbox.left = currentPosition.lon - 0.005;
        bbox.bottom = currentPosition.lat - 0.005;
        bbox.right = currentPosition.lon + 0.005;
        bbox.top = currentPosition.lat + 0.005;
    }
        
	// set phonegap back button if we are on a device
	if (typeof(device) !== 'undefined') {
		document.addEventListener("backbutton", popMainPanel, false);
		// add event listener for menu button => show Main menu
		document.addEventListener("menubutton", showMainMenu, false);
	}

	var loginForm = Ext.getCmp('login-form');
	loginForm.setMasked({
        xtype: 'loadmask',
        zIndex: 999999
    });
	
     getCouchDB();
}



function getCouchDBSuccess(couchDB) {
	// check result: if host is empty or port is -1,
	// couch db has not been initialized yet
	
	console.log("wait for couchDB: " + JSON.stringify(couchDB));
	
	if (couchDB.host == "" || couchDB.port == -1) {
		// wait for 1 second before retrying
		window.setTimeout(getCouchDB(), 1000);
	} else {
		couchURL = 'http://' + couchDB.host + ':' + couchDB.port + '/';
		
		
		connectToCouchDB(couchURL);
	}
		
		
}
var returnToLogin;
var restartConnectToCouchDB;

function connectToCouchDB(couchURL) {
	
	// create instance of couchdb with given url
	if("user" == "user"){
		if(activeUser != null){
			activeDbName = "user_" + md5(activeUser);
		} else {
			activeDbName = "user";
		}
		userDB = new CouchJS(couchURL, activeDbName, "", "");
	} else {
		userDB = new CouchJS(couchURL, "user", "", "");
	}
	

	returnToLogin = false;
	restartConnectToCouchDB = false;
	
	if (!userDB.exists()) {	
		if(!hasInternetConnection()){
			Ext.getCmp('login-form').unmask();
			Ext.Msg.alert('', "No connection to server available. Please start application again when you are online.");
			returnToLogin = true;
		} else {
			console.log("successfully created local user db " + userDB.createDB ());
			registerUser();
			writeDocsToDb();
		}
	} else {
		var dbInfo = userDB.getDoc("userinfo");
		
//		alert("provider: " + dbInfo.provider + "\ndbName:" + dbInfo.dbname);
		
		if(dbInfo == null){
			console.log("deleted local user db " + userDB.deleteDB ());
			restartConnectToCouchDB = true;
		} else {
			// start continuous replication in both directions
			if(hasInternetConnection()){
				//if(userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true) && userDB.replicateTo(serverCouchURL + dbInfo.dbname, true)){
				if(userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true) && userDB.replicateTo(serverCouchURL + dbInfo.dbname, true)){	
					console.log("Started replication!");	
				}
			} else {
				console.log("Data Synchronisation did NOT start! - NO NETWORKCONNECTION");
			}
			
			var userName = dbInfo.provider;
			appSettings.userName = userName;
		}
		finishInitialisation();
	}
}

function finishInitialisation() {
	if(!userDB.exists()){
		window.setTimeout(finishInitialisation,500);		
	} else if (userDB.getDoc("userinfo") == null) {
		window.setTimeout(finishInitialisation,500);
	} else {
		// restarts the function, because of failed initialisation.
	    if(restartConnectToCouchDB){
	    	connectToCouchDB(couchURL);
	    } else if(!returnToLogin) {
			// init url of store
			var treeStore = Ext.data.StoreManager.lookup('commontreestore');
			if (treeStore == undefined) {
			    console.log("Tree store not found!");
			} else {
			    //var storeUrl = couchURL + getCouchDBDatabasename() + "/_design/main/_spatial/_list/treedata/trees";
				var storeUrl = couchURL + getCouchDBDatabasename() + "/_design/main/_list/treedata/trees";
			    treeStore.getProxy().setUrl(storeUrl);
			}
			initGeoLocation();
			
			getExistingTiles();
			
			console.log("---###---");
			loadUserPreferences();
			
			// start notification listener, notificationHandler() is defined in js/couchdb-notification.js
			userDB.notifyChanges(null, notificationHandler);
	
			// set loglevel:
			setLogLevel(appSettings.loglevel);
	
			// Alert for user notification about no caching of current environment:
		    var dontShowAgain = localStorage.getItem("noCaching.dontShowAgain");
		    if (dontShowAgain == null || dontShowAgain == '0') {
	            Ext.Msg.alert(
	                '',
	                'This application will keep you informed about observations in areas of your interest. Please chose "List observations" in main menu and define your areas of interest.<br/><br/><input type="checkbox" id="dontShowAgain" /> Don\'t show again',
	                function() {
	                    if (document.getElementById('dontShowAgain').checked) { 
	                        localStorage.setItem("noCaching.dontShowAgain", "1");
	                    }
	                    else {
	                        localStorage.setItem("noCaching.dontShowAgain", "0");
	                    }
	                }
	            );
		    }
			// add channel for MDAF Notifications
			NOT_addChannel({
					"name": "mdaf",
					"enabled" : true,
					"properties" : {}
				});
			
			// add channel for GCM notifications:
			if(appSettings.useGcm === true) {
        		// register to gcm service
        		window.GCM.register("GCM_RegistrationChange", 
        								function() { console.log("Successfully dispatched registration to GCMPlugin");}, 
        								function() { console.log("Could not dispatch registration to GCMPlugin");} 
        							);
	        } else {
	        	// unregister from gcm service
	        	window.GCM.unregister("GCM_RegistrationChange", 
								function() { console.log("Successfully dispatched registration to GCMPlugin");}, 
								function() { console.log("Could not dispatch registration to GCMPlugin");} 
							);
	        }
			showMainMenu();
	    } else {
	    	Ext.getCmp('login-form').unmask();
	    }
	}
}

/**
  * @brief Trys to get host and port name of local CouchDB instance and saves URL to
  *        global object. Starts synchronization of local and server CouchDB.
  */
function getCouchDB() {
	if(!devReady){
		
		window.setTimeout(getCouchDB,500);
		
	} else {
		
		if(typeof(device) === "object") {
			if(device.platform == "Generic") {
				phoneGapTarget = "browser"; // default is "phone"
			}
		}
		
		if(phoneGapTarget == "phone") {
			
			window.CouchDB.getInstance(function(couchDB) { getCouchDBSuccess(couchDB); },	function(e){ console.log(e); });
			
		} else if (phoneGapTarget == "browser") {
			
			couchURL = 'http://'+ ''+ ':' + '' + '@' + '';
			connectToCouchDB(couchURL);
			
		} else {
			Ext.Msg.alert('', 'Could not connect to database.');
		}
		
	}
	
}



/**
 * Checking if the replications have started, if not, try to start them...
 */
function checkReplications(){
   if(userDB && hasInternetConnection()){
       var dbInfo = userDB.getDoc("userinfo");
       if(!startedReplicationTO){
           userDB.replicateTo(serverCouchURL + dbInfo.dbname, true);
       }
       if(!startedReplicationFROM){
           userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true);
       }
       if(startedReplicationTO){
           console.log("started Replication TO");  
       }
       if(startedReplicationFROM){
           console.log("started Replication FROM");    
       }
   } else {
       console.log("checkReplications - NO INTERNET CONNECTION!!!!");
   }
   console.log("checkReplications - END");
}

/**
 * @brief Calls FI-Ware location platform GE to get the real location of the device and returns true if 
 *          location differs not more than a given value.
 * @param[in] location entered by user
 */
function verifyLocation(longitude, latitude) {
    var locationGEUrlHead = "http://130.206.178.101:3128/location/v1/queries/location?requester=test:test&";
    var address = "address=tel:";
    var locationGEUrlTail = "&requestedAccuracy=1000&acceptableAccuracy=1000&maximumAge=1000&tolerance=DelayTolerant";
    // get msisdn of phone
    var tel = 436642351823;
    var reqUrl = locationGEUrlHead + address + tel + locationGEUrlTail;
    console.log(reqUrl);
    // call FI-Ware location service
    var req = new XMLHttpRequest();
    req.open('GET', reqUrl, false);
    req.send(null);
    if (req.readyState == 4) {
        console.log(req.responseText);
        var response = JSON.parse(req.responseText);
    }
    console.log ("Status: " + req.status);
    return true;
}


/**
  * When Device is ready (e.g. after putting into the background or something)
  */
function onResume() {
	console.log("Resumed!");

	if(getCurrentNetworkState() != null){
		// now check if relication is already started. (maybe networkconenction is active after resume (turned on))
		checkReplications();
	}
}

/**
 * @brief Display the given image on the app screen. 
 *        
 * @param url to the image file source in envirofi image cache.    
 *        
 **/
function displayImage(imageURI) {   
    console.log("displayImage: url = " + imageURI);
    var mainpanel = Ext.getCmp('vtlmainnavigation');

    var img = Ext.create('Ext.Panel', {
        fullscreen: true,
        layout: 'fit',
/*          style: {
            background:'#ffffff',
            backgroundImage: 'url("'+imageURI+'")',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom left',
        },
*/        
        items:[
           {
               xtype: 'pinchzoomimage',
               style:'background-color:#000',
               src: imageURI
           }                 
       ]
    });
    mainpanel.push(img);

}

/**
 * @brief Download file from server. 
 *        
 * @param serverURL url for downloading the file from the server to the file. 
 *        localFileName filename to store the file on the local file system 
 *                      in envirofi image cache directory  
 *        callback called when filetransfer finished; status true/false 
 *                 as parameter to indicate success or failure
 *        
 **/
function transferImageFile(serverURL, localFileName, successCallback, errorCallback) {
    console.log("transferFile: localFilename = " + localFileName);
    var localFile = sdCardPath + "/" + "EnvirofiImages" + '/' + localFileName;
    console.log("transferFile: localFile = " + localFile);
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0, 
        function(fileSystem) {
            fileSystem.root.getDirectory(
                sdCardPath + "/" + "EnvirofiImages",
                {create: true, exclusive: false},
                function (dirEntry) {
                    // Directory exists => success callback:
                    fileSystem.root.getFile(
                        localFile, 
                        {create: true, exclusive: false},
                        function(fileEntry) {
                            // local file created => success callback:
                            var localPath = fileEntry.fullPath;
                            if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
                                localPath = localPath.substring(7);
                            }
                            // transfer file from server to local file system:
                            var ft = new FileTransfer();
                            ft.download(
                                serverURL,
                                localPath,
                                function(entry) {
                                    // file transfer successful:
                                    console.log("*** download complete: " + entry.fullPath);
                                    if (successCallback != undefined && typeof successCallback == 'function') {
                                        successCallback(entry.toURL());
                                    }
                                },
                                function(error) {
                                    // file transfer nor successful:
                                    console.log("error ft.download(): " + error.code);
                                    // remove file from local file system:
                                    fileEntry.remove();
                                    if (errorCallback != undefined && typeof errorCallback == 'function') {
                                        errorCallback();
                                    }
                                }
                            );
                        },
                        function(error) {
                            // error creating local file:
                            console.log("error fileSystem.root.getFile(): " + error.code);
                            if (errorCallback != undefined && typeof errorCallback == 'function') {
                                errorCallback();
                            }
                        }
                    );
                },                    
                function(error) {
                    // error creating directory:
                    console.log("Unable to create new directory: " + error.code);
                    if (errorCallback != undefined && typeof errorCallback == 'function') {
                        errorCallback();
                    }
                }
            );         
        },  
        function(error) {
            // error requesting file system:
            console.log("error window.requestFileSystem(): " + error.code);
            if (errorCallback != undefined && typeof errorCallback == 'function') {
                errorCallback();
            }
        }
    );

}

/**
 * @brief Load an image referenced in the image document identified by the given database object id from the fi-ware object storage ge
 *        or from the mdaf server image db and display it to the user 
 *        
 * @parame observation = database object id of the observation document containing the name of the image file and the id of the image document.  
 *     
 **/
function loadImageFromServer(observation) {
    if (hasInternetConnection()) {
        Ext.Msg.confirm('', 'Downloading of a large data entity can result in high connection expenses. Do you want to start the download now?', 
            function(buttonId) {
                if(buttonId === 'yes') {
                    Ext.Viewport.setMasked({
                        xtype: 'loadmask',
                        message: '',
                        zIndex: 999999
                    });
    
                    var filename = observation.imageFile;
                    var imageDocURL = 'http://enviro7.ait.ac.at/GeoCouch/' + 'attachments/' + observation.imageDocId;
                    console.log("imageDocUrl1: " + imageDocURL);
                    var req = new XMLHttpRequest();
                    req.open('GET', imageDocURL, true);
                    req.send(null);
                    req.onreadystatechange = function () {
                        if (req.readyState == 4) {
                            if (req.status == 200) {
                                var answer = JSON.parse(req.responseText);
                                var imageSrc = imageDocURL + '/' + filename;                            
                                var localFileName = filename;
                                transferImageFile(imageSrc, localFileName, 
                                    function (imageURI) {                                    
                                        //success: 
                                        displayImage(imageURI);
                                        Ext.Viewport.setMasked(false);
                                        // remove old images from cache:
                                        removeOldFiles(sdCardPath + "/" + "EnvirofiImages", 20);
                                    },
                                    function () {                                    
                                        // ToDo: download from couchDB failed => try download from cloud storage
                                    	Ext.Viewport.setMasked(false);
                                        Ext.Msg.alert('', 'Could not load image for this observation.');
                                    }
                                );
                             }
                             else {
                                 // ToDo: try to load image from fi-ware object storage ge:
                            	 Ext.Viewport.setMasked(false);
                                 Ext.Msg.alert('', 'Could not load image for this observation.');
                             }
                         }     
                     }               
                 }
                 else {
                     return;
                 }
             }
        );
    }
    else {
        Ext.Msg.alert('', 'Could not load image for this observation because there is no Internet connection available.');
    }
}

/**
 * @brief Load an image referenced in the observation identified by the given database object id from the image cache in 
 *        local file system or from the sever when it is not yet cached and display it to the user 
 *        
 * @parame observationID = database object id of the observation object containing the reference to the image document.  
 *     
 **/
function loadImage(observationId) {
    console.log("Load image: id = " + observationId);
    // get image filename:
    var observation = userDB.getDoc(observationId);
    // observationId can also be a tree id => the key/value pairs for the image are in doc.properties!
    if (observation.properties != undefined) {
        // observation can also be a tree object!!!!
        observation = observation.properties;
    }
    if (observation.imageFile == undefined) {
        Ext.Msg.alert('', 'No image stored for this observation.');
        return;
    }
    var imageFilename = observation.imageFile;
    var imageSrc = null;
    // try to load image from cache:
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0, 
        function(fileSystem) {
            console.log("getDirectory");
            fileSystem.root.getDirectory(
                sdCardPath + "/" + "EnvirofiImages",
                {create: false, exclusive: false},
                function (dirEntry){
                    dirEntry.getFile(
                        imageFilename, 
                        {create: false}, 
                        function(fileEntry) {
                            // display image:
                            imageSrc = fileEntry.toURL();
                            displayImage(imageSrc);
                        },                    
                        function(error) {
                            // image not in cache:
                            loadImageFromServer(observation);
                        }
                    ); 
                },
                function(error) {
                    // cache directory not existing
                    loadImageFromServer(observation);
                }
            );
        },                    
        function(error) {
            // error requesting file system
            loadImageFromServer(observation);
        }
    );
}

/**
 * @brief Loads all observations/comments related to the current tree from the server and displays
 *        the tree detail data and the comments to the user.
 *        
 * @treeId      
 *        */

function getTreeInformationFromId(treeId){
//	console.log("gettreeinformation: " + couchURL + getCouchDBDatabasename() + '/_design/main/_list/observationdata/observations?key="' + treeId + '"');
	console.log("gettreeinformation: " +  couchURL + getCouchDBDatabasename() + '/_design/main/_list/observationdata/observationsSorted?startkey=["' + treeId + '",0,0]&endkey=["' + treeId + '","\ufff0", 2]');
	// create a new data store which retrieves all comments from the server
	var treeComments = Ext.create('Ext.data.Store', {
		model: 'treeapp.model.observationdetails',
		defaultRootProperty: 'data',
		proxy: {
			type: 'jsonp',
	        // url: 'http://envirofi.ait.ac.at/GeoCouch/observations/_design/main/_list/json/comments?key="' + component.getData().treeid + '"',
	        // url: couchURL + getCouchDBDatabasename() + '/_design/main/_list/observationdata/observations?key="' + treeId + '"',
	        url: couchURL + getCouchDBDatabasename() + '/_design/main/_list/observationdata/observationsSorted?startkey=["' + treeId + '",0,0]&endkey=["' + treeId + '","\ufff0", 2]',
			reader: {
				type: 'json',
				rootProperty: 'data'
			}
		}
	});
	
	// load all data and execute the provided callback function
	// which adds the tree details and all comments of one tree
	// to the current treedetail container
	treeComments.load(function(records, operation, success) {
		console.log("in load comments: " + records.length);
		var treeDetail = Ext.getCmp('treedetail-container');
		
		// initialize new item array
		// we need at least two items: the detail view and the button 
		// at bottom of page
		var treeDetailItems = new Array(records.length + 1);
		
		// variables for height and width of treeDetail
		var treeDetailHeight = 0;
		var treeDetailWidth = 0;
		
	    // add current item to item array
	    treeDetailItems[0] = Ext.create('treeapp.view.TreeDetailTable', {
	        data: Ext.getCmp('treedetail').getData()
	    });
	    
		for (var i = 1; i < records.length + 1; i++) {
			// add vtltreecomment to current component
		    if (records[i-1].getData().image != "null") {
			    // set image type depending on language:
			    switch (records[i-1].getData().imagetype) {
                    case "TREE": records[i-1].getData().imagetype = "Tree"; break;
                    case "LEAF": records[i-1].getData().imagetype = "Leaf"; break;
	                case "FRUIT": records[i-1].getData().imagetype = "Fruit"; break;
	                case "BARK": records[i-1].getData().imagetype = "Tree Bark"; break;
	                case "FLOWER": records[i-1].getData().imagetype = "Flower"; break;
	                case "LEAFCONN": records[i-1].getData().imagetype = "Leaf Connection to Branch"; break;
	                case "OTHER": records[i-1].getData().imagetype = "Other"; break;
	                default: break;
			    }
		    }
		    var idOoI;
		    if (records[i-1].getData().idOoI) {
		    	idOoI = records[i-1].getData().idOoI;
		    }
		    else if (records[i-1].getData().observationId) {
		    	idOoI = records[i-1].getData().observationId;
		    }
		    else {
		    	idOoI = 'undefined';
		    }
		    if (idOoI != 'undefined') {
				treeDetailItems[i] = Ext.create('treeapp.view.TreeDetailTable', {
					data: records[i-1].getData(),
					margin: '0 0 0 20'
				});
		    }
		    else {
				treeDetailItems[i] = Ext.create('treeapp.view.TreeDetailTable', {
					data: records[i-1].getData(),
					margin: '0 0 0 0'
				});
		    }
			console.log("observation " + i + ": " + JSON.stringify(records[i-1].getData()));
			
		}
		
		// set items of detail page
		treeDetail.setItems(treeDetailItems);
		
	}, this);

}

/**
 * 	opens a new view with all Property entrys for the current tree 
 * 
 */
function openPropertyFromTree(property, treeid){
	alert("treeid: " + treeid + "\nproperty: " + property);
//	var el = document.getElementByClass("testTableClick"); 
//	var el = document.getElementByClass("keycell"); 
//	el.addEventListener("click", function(){alert("Wuhuuu!");}, false);
}

/**
 * 	Adds a new Observation for Rating an Entry of an other Observation... Consensusbuilding
 */
function rateObservationProperty(treeid, observationid, propertyname, rateval){
//	var currentTime = new Date();
//	
//	var sendString = {
//	    type: "observation",
//	    user: appSettings.userName,
//	    time: Ext.Date.format(currentTime, 'Y-m-d H:i'),
//	    treenumber: treeid,
//	    parentObservation: observationid,
//	    rateProperty: propertyname,
//	    ratevalue: rateval
//    };
//	
//    console.log(JSON.stringify(sendString));
//
//    if (userDB.putDoc(sendString)) {
//        Ext.Msg.alert('', @treeapp.controller.Main.submitRateObservationProperty.Success@);
//    } else {
//        Ext.Msg.alert('', @treeapp.controller.Main.submitRateObservationProperty.Error@);
//    }
}

/**
 * Check if the the input parameter has a value
 * @param name
 * @returns {Boolean}
 */
function isValid(name) {
    return ((name !== null) && (name !== undefined) && (name !== "") && (name !== 'undefined') && (name != "N/A"));
}

/**
 * Check if the the input parameter is a number value
 * @param name
 * @returns {Boolean}
 */
function isNumber(name){
    return (!isNaN(name));
}

/**
* Check if the the input parameter is a number value
* @param name
* @returns {Boolean}
*/
function getCachingWarningText(){
	return 'Estimated download volume: ';
}

function AoI_toggleReplication(aoi, state) {
	
	var aoidoc = userDB.getDoc(aoi._id);
	aoidoc.active = state;
	
	if(userDB.putDoc(aoidoc)) {
		console.log("AOI: replication status is " + state);
	} else {
		console.log("AOI: ERROR: could not update AoI document!!!!");
	}
	
}

/**
 * updates the AoI documents "execState" property in order to trigger a new replication at the server
 * @param {} aoi represents the given AoI
 * @return {}
 */
function AoI_refresh(aoi) {
	
	var aoidoc = userDB.getDoc(aoi._id);
	aoidoc.execState = "refresh";
	
	var result = userDB.putDoc(aoidoc);
	
	if(result != null) {
		console.log("AOI: saved AoI document");
	} else {
		console.log("AOI ERROR: could not save AoI document!!!!");
	}
	
	return (result != null);
	
}

/**
 * updates the AoI Cache-Tiles
 * @param {} aoi represents the given AoI
 */
function AoI_tiles_refresh(aoi) {
	
	var aoidoc = userDB.getDoc(aoi._id);

	var bbox = {
		left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
		bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
		right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
		top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
	}
	
	cacheCoordinates(bbox);
}

/**
 * deletes all maptiles of the
 * @param {} aoi represents the given AoI
 */
function AoI_tiles_delete(aoi) {
	
	var aoidoc = userDB.getDoc(aoi._id);

	var bbox = {
		left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
		bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
		right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
		top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
	}
	
	deleteCachedTiles(bbox);
}

/**
 * Deletes all documents in the given AoI on the phone (deletion will be replicated to userdb) and
 * the AoI document. 
 * WARNING: this method is very slow! Should be implemented as bulk delete!
 * MISSING: deletion of AoI on server!
 * @param {} aoi
 * @return {}
 */
function AoI_delete(aoi) {
	
	

	var aoidoc = userDB.getDoc(aoi._id);
	
	var bbox = {
		left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
		bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
		right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
		top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
	};
	
	var spatialUrl = couchURL + getCouchDBDatabasename() + "/_design/main/_spatial/_list/treeids/trees?bbox=" +  bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top;
	
	var response = Ext.Ajax.request({
	    url: spatialUrl,
	    async : false,
	    success: function(response){
			// nothing        
	    },
	    failure:function(response, opts){
			alert.log("bulk load error: could not load json document!" + response.request.options.url);
		}
	
	});
	
	var jsonresponse = response.responseText.substring(response.responseText.indexOf("(")+1, response.responseText.length-2);
	var treesArray = JSON.parse(jsonresponse);
	
	for(var i=0; i<treesArray.data.length; i++) {
    	
    	if(userDB.deleteDoc(treesArray.data[i])) {
    		console.log("DELETEing tree with ID " + treesArray.data[i]._id );
    	}
    }

	var result = userDB.deleteDoc(aoi);
	if(result) {
		console.log("AOI: deleted AoI document");
	} else {
		console.log("AOI ERROR: could not delete AoI document!!!!");
	}
	
	return result;
}

/**
 * depricated!
 * @return {Boolean}
 */
function AoI_updateCounter() {
	
	return true;
	detailView.objectsInAoI = detailView.objectsInAoI-1;
	detailView.setHtml( AoI_getDetailViewHtml(detailView.objectsInAoI));
	
	
}

/**
 * Counts the elements in a given AoI
 * IMPROVEMENT: increase execution time of getBBoxCount() by emitting null and count afterwards
 * @param {} aoidata is the AoI data from the store
 * @return {}
 */
function AoI_countObjectsInArea(aoidata) {
	
	var aoidoc = userDB.getDoc(aoidata._id);

	var bbox = {
		left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
		bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
		right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
		top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
	}
	/**
	 * TODO: improve getBBoxCount() by emitting null! Is this possible??
	 */
	var num = userDB.getBBoxCount(bbox, false);
	
	console.log("bboxnum: " + JSON.stringify(num));
	
	return num.count;
}

/**
 * renders the HTML content of the AoI detail view
 * @param {} num represents the number of objects to be displayed
 * @return {}
 */
function AoI_getDetailViewHtml(num) {
	
	var label = 'Objects in Area';

	var html = '<div style="text-align:center; padding-top:20px; padding-bottom: 20px;">';
	html += '<span style="font-size:20px; font-weight:bold;">'+num+' ' + '</span>';
	html += '<span style="font-size:20px;">'+label+'</span>';
	html += '</div>';
	
	return html;
}

/**
 * Triggered if user hits "show on map" at AoI detail view.
 * Jumps to the map/list view and reloads the objects.
 * @param {} aoidata
 */
function AoI_jumpToMap(aoidata, treeDetailsId) {
	
	var aoidoc = userDB.getDoc(aoidata._id);
	if(hasInternetConnection()){
	    setUseCachedMaps(aoidoc, treeDetailsId);
	} else {
		Ext.Msg.alert('', "You are currently offline! Only map tiles which have already been downloaded will be shown!");
	  	Ext.getCmp('vtlmainpanel').setActiveItem(1);
	  	menuState = 'inMainNavigation';
	  	showTreeMap("treemap", "commontreestore", 0, aoidoc, treeDetailsId);
   }
}

/** 
 * Retrieve observation properties from given view object and add them to given json structure.
 * @param view
 * @param properties
 * @return number of items added to properties
 */
function setImageProperties(view, timestamp, properties, callback) {
    if (observationImage.url != null) // image was taken; observationImage.url is file path to image 
    {
        // store on fi-ware cloud object storage:
        storeImageOnCloud(observationImage.url, 
                function(url) {
                    if (url != null) {} // image stored successfully on cloud
                },
                timestamp
        );
        var imageFilename = timestamp + '_' + observationImage.url.replace(/^.*[\\\/]/, '');
        // create image document:
        var imageProperties = {
               type: 'image',
               image: imageFilename
        }
        var imageDocId = userDB.putDocRetId(imageProperties);
        var revision = userDB.getDoc(imageDocId)._rev;
        if (imageDocId != null) {
            storeImageInDatabase(observationImage.url, timestamp, imageDocId, revision, function(success) {
                if (success == true) {
                    // image name:
                    properties.imageFile = imageFilename;
                    // thumbnail:
                    properties.image = observationImage.thumb;
                    // orientation:
                    properties.imageorientation = observationImage.orientation;
                    // image type:
                    if (isValid(view.getValues().imagetype)) {properties.imagetype = view.getValues().imagetype;}
                    // image comment:
                    if (isValid(view.getValues().imagecomment)) {
                    	properties.imagecomment = escapeSpecialChars(view.getValues().imagecomment);
                    }
                    // imageDocId:
                    properties.imageDocId = imageDocId;   
                    observationImage.url = null;
                    observationImage.thumb = null;
                    observationImage.orientation = null;
                    if (callback != undefined && typeof callback == 'function') 
                        callback(true, 1);
                }
                else {
                    // store image in db failed => delete image document:
                    userDB.deleteDoc(imageDocId);
                    observationImage.url = null;
                    observationImage.thumb = null;
                    observationImage.orientation = null;
                    if (callback != undefined && typeof callback == 'function') 
                        callback(false, 0);
                }
            });
        }
        else {
            // image document could not be created, return count=0 and success=false
            if (callback != undefined && typeof callback == 'function') 
                callback(false, 0);
        }
    }
    else {
        // no image to store, return count=0 and success=true
        if (callback != undefined && typeof callback == 'function') 
            callback(true, 0);
    }

}
    
/** 
 * Retrieve observation properties from given view object and add them to given json structure.
 * @param view
 * @param properties
 * @return number of items added to properties
 */
function setObservedProperties(view, timestamp, properties, callback) {
    setImageProperties(view, timestamp, properties, function(success, count) {
        if (success) {
            var counter = count;
            if (isValid(view.getValues().treenumber)) {properties.label = view.getValues().treenumber; counter++;}

            if (isValid(view.getValues().taxonomy_uri)) {properties.taxonomy_uri = view.getValues().taxonomy_uri; counter++;}           
            if (isValid(view.getValues().name)) {properties.name = view.getValues().name; counter++;}
            if (isValid(view.getValues().commonname)) {properties.commonname = view.getValues().commonname; counter++;}

            if (isValid(view.getValues().comment)) {properties.comment = escapeSpecialChars(view.getValues().comment); counter++;}
            if (isValid(view.getValues().area)) {properties.area = view.getValues().area; counter++;}
            if (isValid(view.getValues().street)) {properties.street = view.getValues().street; counter++;}
            if (isValid(view.getValues().height)) {properties.height = parseFloat(view.getValues().height); counter++;}
            if (isValid(view.getValues().diameter)) {properties.diameter = parseFloat(view.getValues().diameter); counter++;}
            if (isValid(view.getValues().circumference)) {properties.circumference = parseFloat(view.getValues().circumference); counter++;}
            if (isValid(view.getValues().bhd)) {properties.bhd = parseFloat(view.getValues().bhd); counter++;}
            if (isValid(view.getValues().year)) {properties.year = parseInt(view.getValues().year); counter++;}
            if (isValid(view.getValues().azimut)) {properties.azimut = parseFloat(view.getValues().azimut); counter++;}
            if (isValid(view.getValues().distance)) {properties.distance = parseFloat(view.getValues().distance); counter++;}
            if (isValid(view.getValues().referencepoint)) {properties.referencepoint = view.getValues().referencepoint; counter++;}
            if (isValid(view.getValues().crowningheight)) {properties.crowningheight = parseFloat(view.getValues().crowningheight); counter++;}
            if (isValid(view.getValues().deadwoodheight)) {properties.deadwoodheight = parseFloat(view.getValues().deadwoodheight); counter++;}
            if (isValid(view.getValues().socialposition)) {properties.socialposition = view.getValues().socialposition; counter++;}
            if (isValid(view.getValues().statusforestinventory)) {properties.statusforestinventory = view.getValues().statusforestinventory; counter++;}
            if (isValid(view.getValues().statussiteinventory)) {properties.statussiteinventory = view.getValues().statussiteinventory; counter++;}
            if (isValid(view.getValues().barkbeetledate)) {properties.barkbeetledate = Ext.getCmp('barkbeetledateId').getFormattedValue(); counter++;}
            if (isValid(view.getValues().barkbeetleaccuracy)) {properties.barkbeetleaccuracy = parseInt(view.getValues().barkbeetleaccuracy); counter++;}
            if (isValid(view.getValues().winddamagecategory)) {properties.winddamagecategory = view.getValues().winddamagecategory; counter++;}
            if (isValid(view.getValues().winddamagedate)) {properties.winddamagedate = Ext.getCmp('winddamagedateId').getFormattedValue(); counter++;}
            if (isValid(view.getValues().winddamageaccuracy)) {properties.winddamageaccuracy = parseInt(view.getValues().winddamageaccuracy); counter++;}
            if (isValid(view.getValues().lightchangesdate)) {properties.lightchangesdate = Ext.getCmp('lightchangesdateId').getFormattedValue(); counter++;}
            if (isValid(view.getValues().lightchangesaccuracy)) {properties.lightchangesaccuracy = parseInt(view.getValues().lightchangesaccuracy); counter++;}
            var treedamage = [];
            if (isValid(view.getValues().treedamage1)) {treedamage[0] = view.getValues().treedamage1; counter++;}
            if (isValid(view.getValues().treedamage2)) {treedamage[1] = view.getValues().treedamage2; counter++;}
            if (treedamage.length > 0) {
                properties.treedamage = treedamage;
            }
            if (callback != undefined && typeof callback == 'function') 
                callback(true, counter+count);
        }
        else {
            // store image failed => do not create the observation object:
            if (callback != undefined && typeof callback == 'function') 
                callback(false, 0);
        }
    });
}
    
/**
  * Set up main controller and register handlers for specified components.
  */
Ext.define('treeapp.controller.Main', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// if the main application is started, call initApp function
			'vtlmainpanel' : {
				initialize: 'initApp'
			},
			// when login button of splash scrren is pressed, remove splash
			// screen and create main menu
			'button[itemId="login_btn"]': {
				tap: 'login'
			},
			// when register button of splash scrren is pressed, remove splash
			// screen and create main menu
			'button[itemId="register_btn"]': {
				tap: 'register'
			},
			// registration_btn is the button in the registration form, and 
			// sends a registaron request to the FI-Ware server
			'button[itemId="registration_btn"]': {
				tap: 'registration'
			},
			// when register button of splash scrren is pressed, remove splash
			// screen and create main menu
			'button[itemId="stayoff_btn"]': {
				tap: 'stayoff'
			},
			// creates the user and user-db, like login but without authentication
			'button[itemId="demo_btn"]': {
				tap: 'demo'
			},
			// when tapping on a list item of vtl list, call showDetail function
			'treelist': {
				itemtap: 'showDetail'
			},
			// if the detail page of a tree is shown, load all comments and pictures,
			// remove all information when it is hidden
			'treedetail': {
				show: 'getTreeInformation',
				hide: 'removeTreeInformation'
			},
            // when listobservations button in main menu is pressed, call pushToMain
            'button[itemId="listobservations"]': {
                tap: 'pushToMain'
            },
			// when reportobservations button in main menu is pressed, call pushToMain
			'button[itemId="reportobservations"]': {
				tap: 'pushToMain'
			},
			// when settings button in main menu is pressed, call pushToMain
			'button[itemId="settings"]': {
				tap: 'pushToMain'
			},
			'button[itemId="areasofinterestBtn"]': {
				tap: 'pushToMain'
			},
			// when addobservation button in tree detail view is pressed, push the 
			// corresponding form on the main navigation view stack
			'button[itemId="addobservationbutton"]': { 
				tap: 'showAddTreeObservation'
			},
			// when open external app button in tree detail view is pressed
			'button[itemId="openExternalAppButton"]': { 
				tap: 'openExternalApp'
			},
			// for creating a tag, which that has a unique link to an observation
			'button[itemId="createtag"]':{
				tap: 'createTreeNdefRecord'
			},
			// initialize tree observation form if it is shown to the user
			'vtlnewtree': {
				show: 'initializeTreeObservationData'
			},
			// when picture button in tree observation view is pressed,
			// let the user take an image
			'button[itemId="imagechoosebutton"]': {
				tap: 'chooseImage'
			},
			// when submitobservation button in tree observation view is pressed, 
			// check user input and send it to server
			'button[itemId="submitobservationbutton"]': {
				tap: 'submitTreeObservation'
			},
			// when submitnewobservation button in new tree view is pressed,
			// submit a new tree to server
			'button[itemId="submitnewobservationbutton"]': {
				tap: 'submitNewTree'
			},
			// when savesettings button of settings dialog is pressed,
			// save all data to appSettings object
			'button[itemId="savesettingsbutton"]': {
				tap: 'saveSettings'
			},
			// if the GPS checkbox of settings dialog is toggled,
			// show or hide the default GPS location text input fields
			'checkboxfield[itemId="settingsgps"]': {
				check: 'toggleGPSSettings',
				uncheck: 'toggleGPSSettings'
			},
			'selectfield[itemId="filtertype"]': {
				change: 'toggleFilter'
			},
			'button[itemId="applyfilterbutton"]': {
				tap: 'applyFilter'
			},
			'button[itemId="removefilterbutton"]': {
				tap: 'removeFilter'
			},
	         // when street item is tapped in new observation form
			'textfield[itemId="street"]': {
                tap: 'selectLocation'
            },
			'button[itemId="deleteAllTiles"]': {
				tap: 'deleteAllTiles'
			},
			'button[itemId="uploadLogfile"]': {
				tap: 'uploadLogfile'
			},
			'button[itemId="restartreplication"]': {
				tap: 'restartReplication'
			},
			'areaofinterestlist' : {
				//disclose: 'pushAoiDetail',
				itemtap: 'pushAoiDetail'
			}
        }
    },
    
    pushAoiDetail : function(list, index, target, record) { 
    	
		Ext.getCmp('aoinavid').push({
           xtype: 'areaofinterestdetail',
           title: record.getAoiName(),
           data: record.data
       	});

	},
	
	/**
	  * @brief Initializes the application by setting the text labels of message boxes and triggering
	  *        the tree store to load first data from the server.
	  * @param[in] component The current component which is initialized.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	initApp: function(component, eOpts) {
		
		if(typeof(device) === "object") {
			if(device.platform == "Generic") {
				phoneGapTarget = "browser"; // default is "phone"
			}
		}
		
		// define "yes" and "no" buttons for dialogs
		Ext.apply(Ext.MessageBox, {YES: {text: 'Yes', itemId: 'yes', ui: 'action'}});
		Ext.apply(Ext.MessageBox, {NO: {text: 'No', itemId: 'no', ui: 'normal'}});
		Ext.apply(Ext.MessageBox, {CANCEL: {text: 'Cancel', itemId: 'cancel'}});
		Ext.apply(Ext.MessageBox, {YESNO: [Ext.MessageBox.NO, Ext.MessageBox.YES], OKCANCEL: [Ext.MessageBox.CANCEL, Ext.MessageBox.OK]});
		
		// set z-index of all messages to a high number such that it is above 
		// all other elements
		Ext.Msg.setZIndex(9999);

        initStartBtn();
	},
	
	/**
	  * @brief tries to get login information
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	login: function(button, event, eOpts) {
		var loginForm = Ext.getCmp('login-form');
		// get values from settings form
		var formValues = loginForm.getValues();
		// save user name
		var userAccount = formValues.loginemailselect;
		var userAccountType = formValues.loginaccounttype;

		console.log("Before checklogin");
		// check login muss noch implementiert werden!!!!!!!!
		var checkloginReturn = 1;
//		var checkloginReturn = checkLogin(userAccount, pwd);
		if(checkloginReturn != -1){
			if(checkloginReturn){
				console.log("Check Login TRUE!");
//				alert("login successful!");
				loginSuccess(userAccount, userAccountType);
			} else {
				console.log("login failed!");
			}
		} else {
			console.log("checkloginReturn() returend -1!!!");
		}
	},
	
	/**
	  * @brief shows registration-form
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	register: function(button, event, eOpts) {
		navigator.app.loadUrl('https://logint2.idm.toon.sul.t-online.de/gcp-web-csc/10000104/', { openExternal:true } ); 
		//showRegistration();
	},
	
	/**
	  * @brief sends registration form to FI-Ware Server
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	registration: function(button, event, eOpts) {
		var registrationForm = Ext.getCmp('registration-form');
		// get values from settings form
		var formValues = registrationForm.getValues();
		// save user name
		var email = formValues.registrationemail;
		var pwd = formValues.registrationpwd;
		var pwdConf = formValues.registrationpwd_confirm;

		
		
		
		/*
		console.log("before registration");
		
		if(checkRegistration(email, pwd, pwdConf)){
			console.log("registration ok");
			//registrationSuccess(email);
		} else {
			console.log("registration failed");
		}
		*/
	},
	
	/**
	  * @brief skips login/registration and stays offline
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	stayoff: function(button, event, eOpts) {
		skipLogin();
	},
	
	/**
	  * @brief creates the user and user-db, like login but without authentication
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	demo: function(button, event, eOpts) {
		var loginForm = Ext.getCmp('login-form');
		// get values from settings form
		var formValues = loginForm.getValues();
		// save user name
		var userEmail = formValues.loginemail.toLowerCase();
		var pwd = formValues.loginpwd;
		var rememberPwd = formValues.loginrememberpwd;

		console.log("!!! DEMO MODE !!!");

		loginSuccess(userEmail, pwd, rememberPwd);
	},
		
    /**
     * @brief Displays the details of a tapped tree item to the user by pushing
     *        a detail view component on the main navigation view.
     * @param[in] list The list component related to the current event.
     * @param[in] index Number of the the tapped item.
     * @param[in] target The inner list component on which the event has been fired.
     * @param[in] record The associated data record of the currently activated item.
     */
   showDetail: function(list, index, target, record) {
       
       /*
       Ext.getCmp('vtlmainnavigation').push({
           xtype: 'treedetail',
           data: record.getData()
       });
       */
   	
		getTreedata(record.getData());
   },
      
   /**
    * Upload logfile to server
    */
   uploadLogfile: function(button, event, eOpts) {
	    window.requestFileSystem(
	            LocalFileSystem.PERSISTENT,
	            0, 
	            function(fileSystem) {
	                console.log("getDirectory");
	                console.log("path: " + couchPath);
	                fileSystem.root.getDirectory(
	                	couchPath,
	                    {create: false, exclusive: false},
	                    function (dirEntry){
	                        dirEntry.getFile(
	                            'couch.log', 
	                            {create: false}, 
	                            function(fileEntry) {
	                                fileEntry.file(
                                		function(file) {
                                			var reader = new FileReader();
                                			reader.onloadend = function(evt) {
                                				var fileContent = "" + evt.target.result;
                                			    var dbInfo = userDB.getDoc("userinfo");
                                			    var dbName = userDB.getDoc("userinfo").dbname;
                                				var data = {
                                					db: dbName,
                            						log: fileContent,
                            						h: md5(dbName + "cy4ABbMap3mowzi5")
                                				}
                                				var url = "http://enviro7.ait.ac.at/~envirofi/GeoCouchUtils/" + "uploadlog.pl";
                                				var response = Ext.Ajax.request({
                                				    url: url,
                                				    async : true,
                                				    success: function(response){
                                				    	// check if request was successful:
                                				    	if (response.status == 200) {
	                                						// delete logfile:   
	                                				    	fileEntry.createWriter(function(writer) {writer.truncate(0); console.log("File Deleted");}, function(error){console.log("Error: " + error.code);});
                                				    	} else {
	                                				    	console.log("response: " + JSON.stringify(response));
	                                				    	console.log("response.status: " + JSON.stringify(response.status));
	                                				    	console.log("response.statusText: " + JSON.stringify(response.statusText));
	                                				    	console.log("response.responseText.msg: " + JSON.stringify(response.responseText.msg));
	                                				    	console.log("response.responseText.error: " + JSON.stringify(response.responseText.msg));
                                				    		Ext.Msg.alert('', 'Error when uploading logfile: HTTP request status is ' + response.status);
                                				    	}
                                				    
                                				    },
                                				    failure:function(response, opts){
                                				    	Ext.Msg.alert('', 'Error when uploading logfile. HTTP request status is ' + response.status);
                                    					console.log("logfile upload failure");
                                				    	console.log("response: " + JSON.stringify(response));
                                				    	console.log("response.status: " + JSON.stringify(response.status));
                                				    	console.log("response.statusText: " + JSON.stringify(response.statusText));
                                				    	console.log("response.responseText.msg: " + JSON.stringify(response.responseText.msg));
                                				    	console.log("response.responseText.error: " + JSON.stringify(response.responseText.msg));
                                					},
                                					params: data                 				
                                				});                             				
                                			};
                                			reader.onerror = function(evt) {
                                				Ext.Msg.alert('', 'Error accessing logfile.');
                                				console.log("Error reading file!");
                                			};
                                			reader.readAsText(file);
                                		},
                                		function(error) {
                                			Ext.Msg.alert('', 'Error accessing logfile.');
                                			console.log("fileEntry.file: " + error.code);
                                		}
	                                );
	                            },                    
	                            function(error) {
	                                Ext.Msg.alert('', 'Error accessing logfile.');
	                                console.log("dirEntry.getFile: " + error.code);
	                            }
	                        ); 
	                    },
	                    function(error) {
                            Ext.Msg.alert('', 'Error accessing logfile.');
                            console.log("fileSystem.root.getDirectory: " + error.code);
	                    }
	                );
	            },                    
	            function(error) {
                    Ext.Msg.alert('', 'Error accessing logfile.');
                    console.log("window.requestFileSystem: " + error.code);
	            }
	        );

   },
   
   /**
    * Upload logfile to server
    */   
   restartReplication: function(button, event, eOpts) {
	    var dbInfo = userDB.getDoc("userinfo");
	    // cancel replications:
		userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true, true);
		userDB.replicateTo(serverCouchURL + dbInfo.dbname, true, true);
		// restart replications:
		userDB.replicateFrom(serverCouchURL + dbInfo.dbname, true);
		userDB.replicateTo(serverCouchURL + dbInfo.dbname, true);
		console.log("Restarted replication!");
   },
   
   /**
   * Delete downloaded map-tiles 
   */
   deleteAllTiles: function(button, event, eOpts){
 
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

   								console.log("tiles to delete: " + entries.length);
   								var i;
   							    for (i=0; i<entries.length; i++) {
   	   								console.log("delete tile " + i + " from " + entries.length);
   							    	var name = entries[i].name;  
   							        entries[i].remove(
   						        		function(entry){
   						        			cachedMaptiles[name] = "false";
   						        			console.log(name + " deleted.");
   						        		},
   						        		function(error){console.log('Error removing file: ' + error.code);}
   						        	);
   							    }
   							    getExistingTiles();
   							},
   							function(error) {console.log("Unable to read directory: " + error.code);}
   					);				
   				},                    
   				function(error) {console.log("Unable to create new directory: " + error.code);}
   			);  	   
   		},  
   		function(error) {console.log("error window.requestFileSystem(): " + error.code);}
   	);

//	console.log("Deleting complete! -------------------------------------------- ");
   },
   
   /**
    * @brief Displays the details of a tapped tree item to the user by pushing
    *        a detail view component on the main navigation view.
    * @param[in] list The list component related to the current event.
    * @param[in] index Number of the the tapped item.
    * @param[in] target The inner list component on which the event has been fired.
    * @param[in] record The associated data record of the currently activated item.
    */
  selectLocation: function(list, index, target, record) {
      console.log('open map for ddelecting location');
  },

	/**
	  * @brief Loads all observations/comments related to the current tree from the server and displays
	  *        the tree detail data and the comments to the user.
	  * @param[in] component Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	getTreeInformation: function(component, eOpts) {
	 	  getTreeInformationFromId(component.getData()._id);
	},
	
	/**
	  * @brief Removes all inner containers of the tree detail page if it gets hidden.
	  * @param[in] component Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	removeTreeInformation: function(component, eOpts) {
	
		// remove all items from current container because it will be repainted anyway
		Ext.getCmp('treedetail-container').removeAll(true, true);
		
	},
	
	/**
	  * @brief Event handler of all buttons of the main menu which sets the corresponding 
	  *        containers as active items (e.g., settings menu).
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	pushToMain: function(button, event, eOpts) {
		var vtlMainPanel = Ext.getCmp('vtlmainpanel');
		if (button.getId() == 'listobservations') {
			// info online... which tiles to use???
 		   if(hasInternetConnection()){
 		      setUseCachedMaps(null, null);
 		   } else {
 			  Ext.Msg.alert('', "You are currently offline! Only map tiles which have already been downloaded will be shown!");   		   
 				vtlMainPanel.setActiveItem(1);
 				menuState = 'inMainNavigation';
  				showTreeMap("treemap", "commontreestore", 0);
 		   }
		} else if (button.getId() ==  'reportobservations') {
            vtlMainPanel.setActiveItem(2);
            menuState = 'inReportObservation';
		} else if (button.getId() ==  'areasofinterestBtn'){	
			
			// get AoI-store
			var aoiStore = Ext.data.StoreManager.lookup('areaofintereststore');
			
			// did it work?
			if (aoiStore == undefined) {
			    console.log("AOI: aoiStore is undefined!");
			} else {
				Ext.Viewport.setMasked({
		            xtype: 'loadmask',
		            message: '',
		            zIndex: 999999
				});

				// set proxy and start loading the AoI-data to the store
				var proxy = getCouchURL() + getCouchDBDatabasename() + "/_design/main/_list/aoidata/aoi";
			    aoiStore.getProxy().setUrl( proxy );
			    //aoiStore.load();
			    
			    aoiStore.load(function(records, operation, success) {
			    	if (success) {
					for(i = 0; i < records.length; i++) {   
			    		console.log("Record " + i + ": " + records[i].get('name'));
			    		var aoidoc = userDB.getDoc(records[i].get('_id'));
						
						var bbox = {
							left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
							bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
							right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
							top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
						}
						
						var bboxParameter = "bbox="+bbox.left+","+bbox.bottom+","+bbox.right+","+bbox.top
						
						// count objects in AoI:
						records[i].set('OoI_count', userDB.getBBoxCount(bbox, false).count);
						
						// load suitable events from database
						var response = Ext.Ajax.request({
							url : getCouchURL() + getCouchDBDatabasename() + "/_design/events/_spatial/_list/eventsdata/activeevents?" + bboxParameter,
						    async : false,
						    success: function(response){ /* do nothing -> it is sync! */  },
						    failure:function(response, opts){
								console.log("LOAD ERROR: Could not load event documents!" + response.request.options.url);
							}
						});
						
						// collect events in data-array to be pushed to store
						var events = JSON.parse(response.responseText);
						if (events.length > 0) {
							var now = new Date();
							for(j=0; j<events.length; j++) {
								console.log("Event: " + JSON.stringify(events[j]));
								var expires = new Date(events[j].timestamps.expires);
								if (expires >= now) {
									console.log("Event active: " + expires);
									if (!(events[j].visited && events[j].visited == 'true')) {
										console.log("Event visited: " + events[j].visited);
										records[i].set('activeEvents', true);
									}
								}
								else {
									// console.log("Event expired: " + expires);
									// userDB.deleteDoc(events[j]);
									events[j].expired = 'true';
									userDB.putDoc(events[j]);
								}
							}
						}
						else {
							records[i].set('activeEvents', false);
							console.log("activeEvents = false");
						}	
			    	}
		            Ext.Viewport.setMasked(false);
				    vtlMainPanel.setActiveItem(7);
					menuState = 'inAreasOfInterest';
			    	} else {
			    		Ext.Msg.alert('', "Could not load list of your areas!");
			    	}
				}, this);
			}
		} else {		
			// set settings as currently saved
			Ext.getCmp('treeappsettings-form').setValues(
				{username: appSettings.userName, 
				 usegps: appSettings.useGPS,
				 defaultlon: appSettings.defaultLocation.lon,
                 defaultlat: appSettings.defaultLocation.lat,
                 defaultalt: appSettings.defaultLocation.alt,
				 mapsource: appSettings.mapSource,
				 publish: appSettings.publish,
                 useGcm : appSettings.useGcm,
                 bboxradius : appSettings.bboxradius,
                 loglevel: appSettings.loglevel,
                 useLocalMaps: appSettings.useLocalMaps,
                 mainMenuEventCount: appSettings.mainMenuEventCount});
			if (appSettings.useGPS == false) {
			    // show default geolocation:
			     Ext.getCmp('settingsdefaultlon').setHidden(false);
                 Ext.getCmp('settingsdefaultlat').setHidden(false);
                 Ext.getCmp('settingsdefaultalt').setHidden(false);
			}
		
			vtlMainPanel.setActiveItem(3);
			menuState = 'inSettings';
		}
			
	},
	
	/**
	  * @brief Callback function in case the user presses the "add observation" button
	  *        in the tree details view component. The "add observation" view is pushed
	  *        on the stack of the main navigation.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	showAddTreeObservation: function(button, event, eOpts) {
		
		var treeData = Ext.getCmp('treedetail').getData();
		
		Ext.getCmp('vtlmainnavigation').push({
			xtype: 'vtlnewtree',
			data: treeData
        });
		
	},
	
	/**
	  * @brief Callback function in case the user presses the "create NFC tag" button
	  *        in the tree details view component. The "create NFC tag" view is pushed
	  *        on the stack of the main navigation.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	createTreeNdefRecord: function(button, event, eOpts){
		createTreeNdefRecord();
	},	
	
	/**
	  * @brief Callback function in case the user presses the "open external app" button
	  *        in the tree details view component. An url is created containing the tree location and 
	  *        sent to phonegap navigator.app.loadUrl. This causes that the user can select between different
	  *        applications installed on the phone and able to interpret the url.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	openExternalApp: function(button, event, eOpts) {
		var treeData = Ext.getCmp('treedetail').getData();
		var OoIData = userDB.getDoc(treeData._id);
		var url = 'http://maps.google.com/maps?z=15&t=m&q=loc:';
		url += OoIData.geometry.coordinates[1] + '+' + OoIData.geometry.coordinates[0];
		navigator.app.loadUrl(url, { openExternal:true } );
	},

	
	/**
	  * @brief Initializes the "add observation" form by setting the tree id and user name fields.
	  * @param[in] button Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	initializeTreeObservationData: function(component, eOpts) {
		var treeForm = Ext.getCmp('vtlnewtree-form');
		
		var selectProperty = Ext.getCmp('selectproperty');
	    if (observationInitialize.createTree == true) {
	        selectProperty.setOptions([
	                                   {text: 'Select', value: 'empty'},
	                                   //{text: 'Inventory', value: 'inventoryId'},
	                                   {text: 'Identification', value: 'speciesId'},
	                                   {text: 'Location', value: 'locationId'},
	                                   {text: 'Length Properties', value: 'lengthpropertiesId'},
	                                   {text: 'Planting Year', value: 'yearId'},
	                                   {text: 'Comment', value: 'commentId'},
                                       {text: 'Image', value: 'imageId'},
                                       {text: 'Classifications', value: 'classificationId'},
                                       {text: 'Status', value: 'statusId'}                                       
	                         ]);
    	    Ext.getCmp('submitnewobservationbutton').setHidden(false);
    	    Ext.getCmp('submitobservationbutton').setHidden(true);
    	    // initialize fields for new tree:
            if (observationInitialize.address != null) {
                treeForm.setValues({street: observationInitialize.address});
            }
            else {
                treeForm.setValues({street: ""});
            }
            if (observationInitialize.location != null) {
                treeForm.setValues({location_lat: observationInitialize.location.lat});
                treeForm.setValues({location_lon: observationInitialize.location.lon});
                
//                treeForm.setValues({gk_easting: easting});
//                treeForm.setValues({gk_northing: northing });
            }
            else {
                treeForm.setValues({location_lat: ""});
                treeForm.setValues({location_lon: ""});
            }
            if (observationInitialize.altitude != null) {
                treeForm.setValues({location_alt: observationInitialize.altitude});
            }
            else {
                treeForm.setValues({location_alt: ""});
            }

	    }
	    else {
            selectProperty.setOptions([
                                       {text: 'Select', value: 'empty'},
                                       {text: 'Inventory', value: 'inventoryId'},
                                       {text: 'Identification', value: 'speciesId'},
                                       {text: 'Location', value: 'locationId'},
                                       {text: 'Length Properties', value: 'lengthpropertiesId'},
                                       {text: 'Planting Year', value: 'yearId'},
                                       {text: 'Comment', value: 'commentId'},
                                       {text: 'Image', value: 'imageId'},
                                       {text: 'Classifications', value: 'classificationId'},
                                       {text: 'Status', value: 'statusId'}                                       
                             ]);
            Ext.getCmp('inventoryId').setHidden(true);
            Ext.getCmp('submitnewobservationbutton').setHidden(true);
            Ext.getCmp('submitobservationbutton').setHidden(false);	        
            // initialize read-only textfield for tree id
            var treeData = component.getData();
            treeForm.setValues({treeid: treeData._id});
            treeForm.setValues({user: appSettings.userName});      
	    }
        selectProperty.addAfterListener('change', 
                function(field, newValue, oldValue, eOpts) {
                    var selected = Ext.getCmp(this.getValue());
                    if (selected != undefined) {
                        selected.setHidden(!(selected.getHidden()));
                    }
                }  
        );
        
		// reset init values:
		observationInitialize = {
		        location: null,
		        altitude: null,
		        address: null,
		        createTree: false
		    }
	},
	
	/**
	  * @brief Event handler for the "camera" button of the "add observation" form. Triggers
	  *        PhoneGap to take a 100x300 px picture and call getImage function in case of success.
	  * @param[in] button Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	chooseImage: function(button, event, eOpts) {
	    var cameraOptions = {
                sourceType: Camera.PictureSourceType.CAMERA,
                destinationType: Camera.DestinationType.FILE_URI,
                quality: 100,
                MediaType: Camera.MediaType.PICTURE,
                targetWidth: -1,
                targetHeight: -1,
//                targetWidth: 1944,
 //               targetHeight: 2592,
                correctOrientation: true
            };
		navigator.camera.getPicture( getImage, getNoImage, cameraOptions );
	},
	
	/**
	  * @brief Event handler for the "submit" button of the "add observation" form. A valid user name
	  *        and comment has to be provided before all data will be transmitted to the server.
	  * @param[in] button Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	submitTreeObservation: function(button, event, eOpts) {
		var treeForm = Ext.getCmp('vtlnewtree-form');
		Ext.Viewport.setMasked({
	            xtype: 'loadmask',
	            message: '',
	            zIndex: 999999
	    });

		var currentTime = new Date();
		//console.log("Current time: " + Ext.Date.format(currentTime, 'Y-m-d H:i'));
		
		var sendString = {
		    type: "observation",
		    user: appSettings.userName,
		    time: Ext.Date.format(currentTime, 'Y-m-d H:i'),
		    treeid: treeForm.getValues().treeid
        };
	    setObservedProperties(treeForm, currentTime.getTime(), sendString, function(success, counter) {
	        if (success) {
	            if (counter > 0) {
	                if (userDB.putDoc(sendString)) {
	                    Ext.Msg.alert('', "Saved observation of selected tree.");
	                } else {
	                    Ext.Msg.alert('', "Error when uploading observation. HTTP status code " + req.status + ". " + req.statusText);
	                };
	            }
	            else {
	                Ext.Msg.alert('', "No observation data to save.");
	            }
	            popMainPanel(); 
	            Ext.Viewport.setMasked(false);
	        }
	        else {
	        	Ext.Viewport.setMasked(false);
	            Ext.Msg.alert('', "Error when uploading observation. HTTP status code " + req.status + ". " + req.statusText);
	        }
	    });
        
        
	},
	
	/**
	  * @brief Event handler for the "submit" button of the "report tree" form. All data as well as
	  *        current location and time stamp is saved on the server.
	  * @param[in] button Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	submitNewTree: function(button, event, eOpts) {

		var treeForm = Ext.getCmp('vtlnewtree-form');
		Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: '',
            zIndex: 999999
        });
		
		// check if all mandatory fields are set (=tree label/number)
		if(!treeForm.getValues().treenumber || treeForm.getValues().treenumber == null || treeForm.getValues().treenumber == "") {
			Ext.Viewport.setMasked(false);
			Ext.Msg.alert('', "Please specify all mandatory properties.");
			return;
		}
		
//		verifyLocation(treeForm.getValues().location_lon, treeForm.getValues().location_lat);
		var currentTime = new Date();
		
		// send a json object to couchdb
		var sendString = {
			time: Ext.Date.format(currentTime, 'Y-m-d H:i'),
			geometry: {
                alt: parseFloat(treeForm.getValues().location_alt),
                coordinates: [
                    parseFloat(treeForm.getValues().location_lon),
                    parseFloat(treeForm.getValues().location_lat)
                ],
				type: "Point"
			},
			replication: {
			    publish: appSettings.publish,
			    access: []
			}
		};
		var properties = {
		    provider: appSettings.userName,
		    treeid: treeForm.getValues().treenumber
		};
		setObservedProperties(treeForm, currentTime.getTime(), properties, function(success, counter) {
		    if (success) {
		        sendString.properties = properties;
    
		        console.log("SENDSTRING: " + JSON.stringify(sendString));
        
		        if (userDB.putDoc(sendString)) {
		            Ext.Msg.alert('', "Thank you for reporting a new tree!");
		        } else {
		            Ext.Msg.alert('', "Error when uploading observation. HTTP status code " + req.status + ". " + req.statusText);
		        };
		        popMainPanel(); 
		    }
		    else {
		        Ext.Msg.alert('', "Error when uploading observation. HTTP status code " + req.status + ". " + req.statusText);
		    }
		    Ext.Viewport.setMasked(false);
		});
        
	},
	
	/**
	  * @brief Shows or hides the default longitude/latitude text fields of the settings dialog,
	  *        depending on the status of the "use GPS" checkbox.
	  * @param[in] checkBox Component related to current event.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	toggleGPSSettings: function(checkBox, eOpts) {
		Ext.getCmp('settingsdefaultlon').setHidden(checkBox.getChecked());
        Ext.getCmp('settingsdefaultlat').setHidden(checkBox.getChecked());
        Ext.getCmp('settingsdefaultalt').setHidden(checkBox.getChecked());
		checkBox.setValue(checkBox.getChecked());		
	},
	
	/**
	  * @brief Event handler of the save settings menu button which takes all 
	  *        form data and saves it to the global application settings object.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	saveSettings: function(button, event, eOpts) {
		// save all
		
		// get settings form
		var settingsForm = Ext.getCmp('treeappsettings-form');
		settingsForm.setMasked({
            xtype: 'loadmask',
 //           message: 'Downloading ...',
            zIndex: 999999
        });
		// get values from settings form
		var formValues = settingsForm.getValues();
		
		// save user name
		appSettings.userName = formValues.username;
		
		//console.log(formValues.usegps);
		
		// save GPS settings
		appSettings.defaultLocation.alt = parseFloat(formValues.defaultalt);
		currentPosition.alt = appSettings.defaultLocation.alt;
		
		// if useGPS changed from true to false or radius or default position changed, new Bbox has to be calculated: 
		var calcBboxNecessary = false;
		// if radius changed:
		if (appSettings.bboxradius != formValues.bboxradius) {
            appSettings.bboxradius = formValues.bboxradius;
            calcBboxNecessary = true;
        }
		
		if (appSettings.useGPS != formValues.usegps) {
		    appSettings.useGPS = formValues.usegps;
		    if (appSettings.useGPS == false) {
		        pauseGeoLocation();
                calcBboxNecessary = true;
		    }
		    else {
		        resumeGeoLocation();
		    }
		}
		
		if (appSettings.useGPS == false) {
		    var newlon = parseFloat(formValues.defaultlon);
		    var newlat = parseFloat(formValues.defaultlat);
		    if (appSettings.defaultLocation.lon != newlon) {
		        appSettings.defaultLocation.lon = newlon;
		        calcBboxNecessary = true;
		    }
		    if (appSettings.defaultLocation.lat != newlat) {
		        appSettings.defaultLocation.lat = newlat;
		        calcBboxNecessary = true;
		    }       
		    currentPosition.lon = appSettings.defaultLocation.lon;
		    currentPosition.lat = appSettings.defaultLocation.lat;
		    updateEventStore(currentPosition);
		}
        appSettings.publish = formValues.publish;
        
        // save map source:
        appSettings.mapSource = formValues.mapsource;
        // accept WMS only if in Florence area, WMTS only in Vienna area:
/*        if ((currentPosition.lon >= 16.200 && currentPosition.lat >= 48.118 
                && currentPosition.lon <= 16.546 && currentPosition.lat <= 48.325) 
                && appSettings.mapSource == 'WMS') {
            appSettings.mapSource = 'WMTS';
        }
        
        if ((currentPosition.lon >= 11.11 && currentPosition.lat >= 43.72 
                && currentPosition.lon <= 11.33 && currentPosition.lat <= 43.84) 
                && appSettings.mapSource == 'WMTS') {
            appSettings.mapSource = 'WMS';
        }
*/        
        // did user change the useGcm value?

        if(appSettings.useGcm != formValues.useGcm) {
        	// yes - user changed the settings
        	
        	if(formValues.useGcm === true) {
        		// register to gcm service
        		window.GCM.register("GCM_RegistrationChange", 
        								function() { console.log("Successfully dispatched registration to GCMPlugin");}, 
        								function() { console.log("Could not dispatch registration to GCMPlugin");} 
        							);
	        } else {
	        	// unregister from gcm service
	        	window.GCM.unregister("GCM_RegistrationChange", 
								function() { console.log("Successfully dispatched registration to GCMPlugin");}, 
								function() { console.log("Could not dispatch registration to GCMPlugin");} 
							);
	        }
        	
        	
        } 
        
        appSettings.useGcm = formValues.useGcm;
        appSettings.useLocalMaps = formValues.useLocalMaps;
        if (appSettings.mainMenuEventCount != formValues.mainMenuEventCount) {
	        appSettings.mainMenuEventCount = formValues.mainMenuEventCount;
	        updateEventStore();
        }

        // if loglevel changed:
		if (appSettings.loglevel != formValues.loglevel) {
            appSettings.loglevel = formValues.loglevel;
            setLogLevel(appSettings.loglevel);
        }


        saveUserPreferences();
        settingsForm.setMasked(false);
		popMainPanel();
		
	},
	
	/**
	  * @brief Shows only the numeric or textual filter fieldset, depending on the current
	  *        selection.
	  * @param[in] select Component related to current event.
	  * @param[in] newVal The new value of the select field (after change event).
	  * @param[in] oldVal The old value of the select field (before change event).
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	toggleFilter: function(select, newVal, oldVal, eOpts) {
		Ext.getCmp('numericfilter-fieldset').setHidden(newVal.getData().value != 'numeric');
		Ext.getCmp('textualfilter-fieldset').setHidden(newVal.getData().value != 'textual');
	},
	
	/**
	  * @brief Event handler of the apply filter button which filters the current
	  *        active store object based on the provided parameters.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	applyFilter: function(button, event, eOpts) {
		var filterParams = Ext.getCmp('filterform').getValues();
		var treeStore = Ext.data.StoreManager.lookup(dataSource);
		var expr;
		
		// in case we have a numeric filter
		if (Ext.getCmp('filtertype').getValue() == 'numeric') {
		
			var fieldname = filterParams.numericfieldname;
			expr = parseFloat(filterParams.numberexpr);
		
			if (filterParams.numericcriterion == 'l') {
				treeStore.filterBy(function (item) {
					return item.get(fieldname) < expr;
				});
			} else if (filterParams.numericcriterion == 'e') {
				treeStore.filterBy(function (item) {
					return item.get(fieldname) == expr;
				});
			} else if (filterParams.numericcriterion == 'g') {
				treeStore.filterBy(function (item) {
					return item.get(fieldname) > expr;
				});
			}			
			
		} else if (Ext.getCmp('filtertype').getValue() == 'textual') {
			// create a new case insensitive regular expression for easier matching
			expr = new RegExp(filterParams.stringexpr, 'ig');
			treeStore.filter(filterParams.textualfieldname, expr);
		}
		
		Ext.Msg.alert('', 'Filter has been applied successfully!');
	},
	
	/**
	  * @brief Removes all applied filters of the currently active store.
	  * @param[in] button Component related to current event.
	  * @param[in] event The related event object to the current handler.
	  * @param[in] eOpts The options which have been passed to the event listener.
	  */
	removeFilter: function() {
		Ext.data.StoreManager.lookup(dataSource).clearFilter(false);
		Ext.Msg.alert('', 'All applied filters have been removed!');
	}

});
