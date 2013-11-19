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
  * @file js/phonegap-couchdb.js
  * @authors Clemens Geyer, Hermann Huber, maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Couchdb plugin for Phonegap
  */

var CouchDB = function() {
};

CouchDB.prototype.getInstance = function(successCallback, failureCallback) {
	return cordova.exec(successCallback, failureCallback, 'CouchDB', 'getInstance', []);
};

window.CouchDB = new CouchDB();	

var CouchJS = function(couchURL, dbName, username, password) {

	this._timeout = 10000;
	this._couchURL = couchURL;
	this._username = (username && username != "" && phoneGapTarget != "phone") ? username : null;
	this._password = (password && password != "" && phoneGapTarget != "phone") ? password : null;
	
	// add slash at end of couchurl if it does not exist
	if (couchURL.charAt(couchURL.length - 1) != '/') {
		this._couchURL = couchURL.concat('/');
	}
	this._dbName = dbName;
	
	console.log("_couchURL: " + this._couchURL);
	console.log("_username: " + this._username);
	console.log("_password: " + this._password);
	console.log("_dbName: " + this._dbName);

};

CouchJS.prototype.exists = function() {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	
	req.open('GET', this._couchURL.concat(this._dbName), false);
	
	if(phoneGapTarget != "browser") {
		req.setRequestHeader('Content-Type', 'application/json');
	}
	
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	req.send(null);
	
	// if status is 200, database exists
	return (req.status == 200);

};

CouchJS.prototype.createDB = function() {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	
	req.open('PUT', this._couchURL.concat(this._dbName), false);
	
	if(phoneGapTarget != "browser") {
		console.log("set content type!");
		req.setRequestHeader('Content-Type', 'application/json');
	}
	
	console.log("put: " + this._couchURL.concat(this._dbName));
	
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password));
	}
	req.send(null);
	
	// if status is 201, database has been successfully created
	console.log("responsetext craete: "  + JSON.parse(req.responseText));
	return (req.status == 201);

}

CouchJS.prototype.deleteDB = function() {

    var req = new XMLHttpRequest();
    req.timeout = this._timeout;
    
    req.open('DELETE', this._couchURL.concat(this._dbName), false);
    
    if(phoneGapTarget != "browser") {
		req.setRequestHeader('Content-Type', 'application/json');
	}
    
    if (this._username != null && this._password != null) {
        req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password));
    }
    req.send(null);
    
    // if status is 200, database has been successfully removed
    return (req.status == 200);

}

CouchJS.prototype.getDoc = function(docId) {

	var req = new XMLHttpRequest();
	var result = null;
	req.timeout = this._timeout;
	
	req.open('GET', this._couchURL.concat(this._dbName).concat('/').concat(docId), false);
	if(phoneGapTarget != "browser") {
		req.setRequestHeader('Content-Type', 'application/json');
	}
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	req.send(null);
	
	if (req.status == 200) {
		result = JSON.parse(req.responseText);
	}
	
//	console.log("RESULT: " + JSON.stringify(result));
	
	return result;

}

CouchJS.prototype.putDoc = function(newDocument) {

    var req = new XMLHttpRequest();
    req.timeout = this._timeout;
    
    // if document already exists => update it:
    var doc = null;
    if (newDocument._id) {
        doc = this.getDoc(newDocument._id);
        if (doc != null) {
            newDocument._rev = doc._rev;
        }
    }
    req.open('POST', this._couchURL.concat(this._dbName), false);
    req.setRequestHeader('Content-Type', 'application/json');
    if (this._username != null && this._password != null) {
        req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
    }
    req.send(JSON.stringify(newDocument));
    
    return (req.status == 201);

}

CouchJS.prototype.putDocRetId = function(newDocument) {

    var req = new XMLHttpRequest();
    req.timeout = this._timeout;
    
    // if document already exists => update it:
    var doc = null;
    if (newDocument._id) {
        doc = this.getDoc(newDocument._id);
        if (doc != null) {
            newDocument._rev = doc._rev;
        }
    }
    req.open('POST', this._couchURL.concat(this._dbName), false);
    req.setRequestHeader('Content-Type', 'application/json');
    if (this._username != null && this._password != null) {
        req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
    }
    req.send(JSON.stringify(newDocument));
    var id = null;
    if (req.status == 201) {
        console.log("PutDoc Result: " + req.responseText);
        id = JSON.parse(req.responseText).id;  
    }
    return id;
}

CouchJS.prototype.deleteDoc = function(origDoc) {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	
	// if document already exists => update it:
	var doc = null;
	
	if(!origDoc._id) {
		return false;
	}
	
	if(!origDoc._rev) {
	    doc = this.getDoc(origDoc._id);
    	if (doc != null) {
    	    origDoc._rev = doc._rev;
    	} else {
    		return false;
    	}
	}
	var url = this._couchURL.concat(this._dbName).concat("/"+origDoc._id).concat("?rev="+origDoc._rev);

	
	req.open('DELETE', url, false);
	req.setRequestHeader('Content-Type', 'application/json');
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	req.send();

	if (req.status == 200) {
        return true;
    } else {
        return false;
    }
	
}

CouchJS.prototype.replicateTo = function(URL, continuousFlag, cancelFlag) {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	
	req.open('POST', this._couchURL.concat("_replicate"), false);
	req.setRequestHeader('Content-Type', 'application/json');
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	if (cancelFlag) {
		req.send(JSON.stringify({
			source: this._dbName,
			target: URL,
			continuous: continuousFlag,
			cancel: true
		}));	
	}
	else {
		req.send(JSON.stringify({
			source: this._dbName,
			target: URL,
			continuous: continuousFlag
		}));
	}
	
	if(req.status == 200 || req.status == 202){
		startedReplicationTO = true;
		console.log("test - TO");
	}
	
	return (req.status == 200 || req.status == 202);

}

CouchJS.prototype.replicateFrom = function(URL, continuousFlag, cancelFlag) {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	
	req.open('POST', this._couchURL.concat("_replicate"), false);
	req.setRequestHeader('Content-Type', 'application/json');
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	if (cancelFlag) {
		req.send(JSON.stringify({
			source: URL,
			target: this._dbName,
			continuous: continuousFlag,
			cancel: true
		}));	
	}
	else {
		req.send(JSON.stringify({
			source: URL,
			target: this._dbName,
			continuous: continuousFlag
		}));
	}
	
	if(req.status == 200 || req.status == 202){
		startedReplicationFROM = true;
		console.log("test - FROM");
	}
	
	return (req.status == 200 || req.status == 202);

}

var stopPolling;

CouchJS.prototype.stopNotifications = function() {
	stopPolling = true;
}
	
CouchJS.prototype.notifyChanges = function(URL, callback) {
	
	stopPolling = false;
	
	if(URL == null) {
		// use default url
		URL = this._couchURL.concat(this._dbName);
	}
	
	console.log("Start notification polling for URL" + URL);
	
	// poll from current last_seq number
	var last_seq;

	// retrieve current sequence from db
	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	req.open('GET', URL, false);

	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200) {
					
				var response = JSON.parse(req.responseText);
				// set last_seq
				last_seq = response.update_seq;
				console.log("notifyChanges: responeText = " + req.responseText);
				console.log("notifyChanges: lastSeq = " + last_seq);	
			}
		}
	};
	
	req.send(null);
	
	// call longpoll() in a recursive way
	function longpoll(URL, last_seq) {
		
		if (stopPolling == false) {
			// build couchdb _changes url
			var changes_url = URL.concat("/_changes?feed=longpoll&include_docs=true&limit=1");
			
			var req = new XMLHttpRequest();
			req.timeout = this._timeout;
			
			if (last_seq > 0) {
				changes_url = changes_url + "&since=" + last_seq;
			}
			
//			console.log("[CHANGES-LISTENER]: new url = " + changes_url);
			req.open('GET', changes_url, true);
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (req.status == 200) {
						var response = JSON.parse(req.responseText);
						// console.log("[CHANGES-LISTENER]: new document in database ---------------------------------------");
						
						var length = response.results.length; // number of documents (sometimes is zero!)
						var sequence = response.last_seq; // whats the current sequence?
						
						// does current poll contain a document?
						if(length > 0) {
							
							var doc = response.results[0].doc;
//							console.log("[CHANGES-LISTENER]: document definition: " + JSON.stringify(doc));
							// if available call callbackfunction
							if (callback != undefined && typeof callback == 'function') callback(doc);
							
						} /*else {
							console.log("[CHANGES-LISTENER]: new document is empty");
						}*/
						
						// update sequence for next call of longpoll()
						last_seq = sequence;
						
					} else if (req.status == 0) {
						console.log("[CHANGES-LISTENER]: notifyChanges: connection error; req.status == 0");
					} else {
						console.log("[CHANGES-LISTENER]: notifyChanges: connection error; req.status == " +req.status);
					}
					
					// poll for next change with updated sequence
					longpoll(URL, last_seq);
				}
			}			
			req.send(null);
		}
	};
	
	// initial call of longpoll()
	longpoll(URL, last_seq);
}

//get the local count of objects in the boundingbox
CouchJS.prototype.getBBoxCount = function(bbox, online) {

	var req = new XMLHttpRequest();
	req.timeout = this._timeout;
	var result = null;
	
	var onlineViewExtension = "";
	if(online){
		onlineViewExtension = "_list/treedata_unpublish/";
	}
	
	var view = "/_design/main/_spatial/" + onlineViewExtension + "trees";
	var bboxstr = '?bbox=' + bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top + '&count=true';

	req.open('GET', this._couchURL.concat(this._dbName).concat(view).concat(bboxstr), false);
	
	
	//console.log("online?: " + online + "   -->  calc Count Url: " + this._couchURL.concat(this._dbName).concat(view).concat(bboxstr))
	
	if(phoneGapTarget != "browser") {
		req.setRequestHeader('Content-Type', 'application/json');
	}
	
	if (this._username != null && this._password != null) {
		req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
	}
	
	req.send(null);
		
	if (req.status == 200) {
		result = eval( '(' + req.responseText + ')');
	}
	return result;
}

//get the local count of tree objects in the database
CouchJS.prototype.getCount = function() {
    
    var req = new XMLHttpRequest();
    var result = null;
    req.timeout = this._timeout;
    
    var view = "_design/main/_list/counttrees/trees";
    req.open('GET', this._couchURL.concat(this._dbName).concat('/').concat(view), false);
    
    if(phoneGapTarget != "browser") {
		req.setRequestHeader('Content-Type', 'application/json');
	}
	
    if (this._username != null && this._password != null) {
        req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
    }
    req.send(null);
    
    if (req.status == 200) {
        result = JSON.parse(req.responseText);
        return result.count;
    }
    else {
        return null;
    }
}

//get the local count of tree objects in the database
CouchJS.prototype.getDocCount = function() {
    
    var req = new XMLHttpRequest();
    var result = null;
    req.timeout = this._timeout;
    
    req.open('GET', this._couchURL.concat(this._dbName), false);
    if (this._username != null && this._password != null) {
        req.setRequestHeader("Authorization", "Basic " + window.btoa(this._username + ":" + this._password ));
    }
    req.send(null);
    
    if (req.status == 200) {
        result = JSON.parse(req.responseText);
        return result.doc_count;
    }
    else {
        return 0;
    }
}
