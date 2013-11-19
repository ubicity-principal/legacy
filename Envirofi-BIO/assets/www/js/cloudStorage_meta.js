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
  * @file js/cloudStorage.js
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Interface to the FI-Ware Cloud Object Storage GE.
  *        cloudStorage_meta.js will be compiled to cloudStorage when the ant 
  *        build is performed and the string constants are replaced by the strings
  *        defined in the .properties files.
  */


/* 
 * var rootCreated indicates if the root container on fiware is existing
 */
var rootCreated = false;
var authToken = null;

/**
 * @brief   Dynamically load javascript code into the app. This function is needed for loading 
 *          FI-Ware IDM script to login at the FI-Ware testbed. 
 *           
 * @return
 */
function loadScript(scriptname, successCallback) {  
    var snode = document.createElement('script');  
    snode.type = 'text/javascript';
    snode.src = scriptname;
    snode.onload = successCallback;
    document.getElementsByTagName('head')[0].appendChild(snode);  
  }  

/**
 * @brief   Returns the name for an image container based on the current date and formatted as "YYYY-mm-dd"
 * @return  formatted date string
 */
function getContainerName() {
    var currentTime = new Date();
    var month = currentTime.getMonth() +1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = currentTime.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    return currentTime.getFullYear() + '-' + month + '-' + day;
}
 
/**
 * @brief   Store one image on the cloud object storage.
 *          The image is stored in a container named by the date 
 *          when the request is performed.  
 * @param   imageURI: location of image file in local file system
 *          callback: called when image store procedure is finished  
 *          namePrefix: the file is stored under the original file name plus this prefix (form is <prefix>_<filename>) 
 */
function storeImageOnCloud(imageURI, callback, namePrefix) {
    if (authToken != null) {
        if (rootCreated) {
            storeImage(imageURI, callback, namePrefix);
        }
        else {
            createRootFolder(imageURI, callback, namePrefix);
        }
    }
    else {
        authenticate( 
            function () {
                storeImageOnCloud(imageURI, callback, namePrefix);
            },
            function () {
                // ToDo: authentication failed => do nothing for now
                null;
            }
        );
    }
}

function createRootFolder(imageURI, callback, namePrefix) {
    var url = "@fiWare.CloudStorage.authUrl@" + '/' + "@cloudStorage.rootContainer@";
    var req = new XMLHttpRequest();
    req.open('PUT', url, true);
    req.setRequestHeader('X-Auth-Token', authToken);
    req.send(null);
    req.onreadystatechange = function() { 
        if (req.readyState == 4) {
            if (req.status >= 200 && req.status <= 204) {
                rootCreated = true;
                storeImageOnCloud(imageURI, callback, namePrefix);
            }
            else {
                if (callback != undefined && typeof callback == 'function') {
                    callback(null);
                }
            }
        }
    } 
}

function authenticate(successCallback, errorCallback) {
    var req = new XMLHttpRequest();
    
    req.open('POST', "@fiWare.CloudStorage.url@", true);
    req.setRequestHeader('Content-Type', 'application/json');
    
    var auth = {
        auth: {
            project: "@fiWare.CloudStorage.project@",
            passwordCredentials: {
                username: "@fiWare.CloudStorage.user@",
                password: "@fiWare.CloudStorage.pwd@"
            },
            tenantId: "@fiWare.CloudStorage.tenantId@"
        }
    }
    
    req.send(JSON.stringify(auth));
    req.onreadystatechange = function() { 
        if (req.readyState == 4) {
            if (req.status == 200) {
                var response = JSON.parse(req.responseText);
                authToken = response.access.token.id;
                console.log("X-Auth-Token: " + authToken); 
                if (successCallback != undefined && typeof successCallback == 'function') {
                    successCallback();
                }
            }
            else {
                if (errorCallback != undefined && typeof errorCallback == 'function') {
                    errorCallback();
                }
            }
        } 
    }  
}

function storeImageInDatabase(imageURI, timestamp, imageDocumentId, rev, callback) {
    var container = null;
    var filename = timestamp + '_' + imageURI.replace(/^.*[\\\/]/, '');
    var url = getCouchURL() + getCouchDBDatabasename() + '/' + imageDocumentId + '/' + filename + '?rev=' + rev;
    console.log("storeImageInDatabase - url = " + url);
    var success = false;
    return cordova.exec(
            function(val) {
                if (callback != undefined && typeof callback == 'function') {
                    callback(true);
                }
            },  
            function(val) {
                if (callback != undefined && typeof callback == 'function') {
                    callback(false);
                }
            },
            'CloudStorage', 
            'storeFile',  
            [url, imageURI]);  
}

function storeImage(imageURI, callback, namePrefix) {
    var container = null;
    var url = "@fiWare.CloudStorage.authUrl@" + '/' + "@cloudStorage.rootContainer@";
    var filename = imageURI.replace(/^.*[\\\/]/, '');
    console.log("image URI: " + imageURI);
    console.log("File: " + filename);
    url = url + '/' + namePrefix + '_' + filename;
    return cordova.exec(
            function(val) {
                if (val >= 200 && val <= 204) {
                    if (callback != undefined && typeof callback == 'function') {
                        callback(url);
                    }
                }
                if (val == 401) {
                    // Unauthorized => token expired => authenticate and try again:
                    authToken = null;
                    console.log("Unauthorized!");          
                    storeImageOnCloud(imageURI, callback, namePrefix);
                }
                else {
                    // callback is called to store the url in the observation object:
                    if (callback != undefined && typeof callback == 'function') {
                        callback(null);
                    }
                }
            },  
            function(val) {
                if (callback != undefined && typeof callback == 'function') {
                    callback(null);
                }
            },
            'CloudStorage', 
            'uploadFile',  
            [url, imageURI, authToken]); 
}

/**
 * @brief   
 * @return
 */
function onFiWareLoginSuccess() {
    console.log("login success");
    loginDone = true; 
}

function onFiWareLoginError() {
    console.log("login error");
    loginDone = false;    
}

/**
 * @brief   Login user on the fiware testbed. Should be done only once when the app starts. 
 *           
 * @return
 */      
function loginFiWareTestbed() {
    if (typeof JSTACK == "undefined") {
        console.log("Error: Download of javascript for JSTACK login!");
    }
    else {
        console.log("login jstack");
        JSTACK.IdM.loginUser("@fiWare.CloudStorage.user@", "@fiWare.CloudStorage.pwd@", onFiWareLoginSuccess, onFiWareLoginError);
    }
}
