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
  * @file src/CouchDB.java
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Android Phonegap plugin for instantiating CouchDB on the phone
  */

package com.phonegap.plugins;


import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.*;

import android.util.Log;



import com.phonegap.plugins.CouchDBHostInfo;


//@SuppressWarnings("unused")
public class CouchDB extends Plugin {
	
	public static final String LOG_TAG = "PhoneGap.Plugin.CouchDB";
	
	protected static final String ACTION_GETINSTANCE = "getInstance";
	
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		if (ACTION_GETINSTANCE.equals(action)) {
			 JSONObject couchDBInfo = new JSONObject();
			 try {
				couchDBInfo.put("host", CouchDBHostInfo.getHost());
				couchDBInfo.put("port", CouchDBHostInfo.getPort());
				result = new PluginResult(Status.OK, couchDBInfo);
			} catch (JSONException e) {
				Log.d(LOG_TAG, "Could not create JSON object!");
				result = new PluginResult(Status.JSON_EXCEPTION);				
			}
			 
		}
		return result;
	}

}
