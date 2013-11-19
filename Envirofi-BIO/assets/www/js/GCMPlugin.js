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
  * @file js/fileUtils.js
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short Module for handling Google Cloud Messaging notifications
  */
/**
 *
 * @return Instance of GCM
 */
var GCM = function() {

}


/**
 *
 *
 *
 */
GCM.prototype.register = function(eventCallback, successCallback, failureCallback) {

  if ( typeof eventCallback != "string")    // The eventCallback has to be a STRING name not the actual routine like success/fail routines
  {
    var e = new Array();
    e.msg = 'eventCallback must be a STRING name of the routine';
    e.rc = -1;
    failureCallback( e );
    return;
  }

	
    return cordova.exec(successCallback,      //Callback which will be called when directory listing is successful
              failureCallback,       //Callback which will be called when directory listing encounters an error
              'GCMPlugin',        //Telling Cordova that we want to run "DirectoryListing" Plugin
              'register',             //Telling the plugin, which action we want to perform
              [{ ecb : eventCallback }]);          //Passing a list of arguments to the plugin,
                          // The ecb variable is the STRING name of your javascript routine to be used for callbacks
                          // You can add more to validate that eventCallback is a string and not an object
};


GCM.prototype.unregister = function(eventCallback, successCallback, failureCallback ) {


    return cordova.exec(successCallback,      //Callback which will be called when directory listing is successful
              failureCallback,       //Callback which will be called when directory listing encounters an error
              'GCMPlugin',        //Telling Cordova that we want to run "DirectoryListing" Plugin
              'unregister',             //Telling the plugin, which action we want to perform
              [{ ecb : eventCallback }]);          //Passing a list of arguments to the plugin,
};

GCM.prototype.notify = function(notificationText, successCallback, failureCallback ) {


    return cordova.exec(successCallback,      //Callback which will be called when directory listing is successful
              failureCallback,       //Callback which will be called when directory listing encounters an error
              'GCMPlugin',        //Telling Cordova that we want to run "DirectoryListing" Plugin
              'notify',             //Telling the plugin, which action we want to perform
              [{ notification : notificationText }]);          //Passing a list of arguments to the plugin,
};




/*if( cordova.addPlugin ){
  cordova.addConstructor(function() {
    //Register the javascript plugin with Cordova
    cordova.addPlugin('GCM', new GCM());
  });
}else{*/
  window.GCM = new GCM();
//}

