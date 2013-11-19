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
  * Project: ENVIROFI WP1 Prototype
  *
  * @file js/Utils.js
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short General purpose utility functions.
  */

function formatTimeSpan(dateObject) {

	var now = new Date();

	var diffMillisec = now.getTime() - dateObject.getTime();
	var diffMin = Math.abs(diffMillisec / (1000*60 )); // difference in minutes
	var formatedTime = ""; // formated return value


	
	if(diffMin <= 0) {
		return "0min";
	}
	
	// is the time difference more than one day?
	if(diffMin >= 1440) {
		var days = Math.floor(diffMin / 1440);
		formatedTime += days + ((days > 1) ? "days " : "day ");
		diffMin %= 1440;
	}
	
	// is the remaining time difference more than one hour?
	if(diffMin >= 60) {
		var hours = Math.floor(diffMin / 60);
		formatedTime += hours + ((hours > 1) ? "hours " : "hour ");
		diffMin %= 60;
	}

	// any minutes left?
	if(diffMin > 0) {
		formatedTime += Math.floor(diffMin) +"min. ";
	}

	return formatedTime;

}

/** 
 * Escape special characters which are not allowed in a JSON string.
 * @param val
 * @return val containing escaped characters
 */
escapeSpecialChars = function(val) {
    if (typeof(val)!="string") return val;
    return val      
        .replace(/[\\]/g, '\\\\')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t')
        .replace(/[\"]/g, '\\"')
        .replace(/\\'/g, "\\'"); 
};

/**
 * Truncate file to length 0
 */
function truncateFile(path, filename) {
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0, 
        function(fileSystem) {
            console.log("getDirectory");
            console.log("path: " + path);
            fileSystem.root.getDirectory(
            	couchPath,
                {create: false, exclusive: false},
                function (dirEntry){
                    dirEntry.getFile(
                    	filename, 
                        {create: false}, 
                        function(fileEntry) {
                        	console.log("response: " + JSON.stringify(response));
     				    	fileEntry.createWriter(
 				    			function(writer) {
 				    				writer.truncate(0); 
 				    				console.log("File Deleted");
			    				}, 
			    				function(error){
			    					console.log("Error: " + error.code);
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
}

/**
 * Set loglevel to 'error', 'warning', 'info', or 'debug'
 */
function setLogLevel(level) {
	var configUrl = getCouchURL() + "_config/log/level";
	
	console.log("loglevel url: " + configUrl);
	console.log("loglevel level: " + level);

	// query current loglevel from couchdb:
	var currentLevel = level;
    var req = new XMLHttpRequest();
    req.open('GET', configUrl, false);
    req.send(null);
	console.log("Query loglevel status: " + req.status);
    if (req.status == 200) {
    	console.log("Query loglevel result: " + req.responseText);
    	currentLevel = req.responseText;
    }
    else {
    	Ext.Msg.alert('', 'Could not change log level of database. Please upload logfile.');
    }
	
	// update couchdb loglevel:
    if (currentLevel != level) {
	    var req = new XMLHttpRequest();
	    req.open('PUT', configUrl, false);
	    req.setRequestHeader("Content-Type", "application/json");
	    req.send('\"' + level + '\"');
		console.log("Change loglevel status: " + req.status);
	    if (req.status == 200) {
	    	console.log("Change loglevel result: " + req.responseText);
	        // truncate couchdb logfile to 0:
	    	truncateFile(getCouchPath(), 'couch.log');
	     }
	     else {
	    	 Ext.Msg.alert('', 'Could not change log level of database. Please upload logfile.');
	     }
    }
}

