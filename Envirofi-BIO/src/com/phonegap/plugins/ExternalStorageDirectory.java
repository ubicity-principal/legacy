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
  * @file src/ExternalStorageDirectory.java
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Android Phonegap plugin for accessing the mobile phone's file system
  */

package com.phonegap.plugins;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import android.content.Context;
import android.content.ContextWrapper;
import android.os.Environment;
import android.util.Log;

/**
 * This class echoes a string called from JavaScript.
 */
public class ExternalStorageDirectory extends Plugin {

	public static final String Tag="ExternalStorageDirectory";

	/**
     * Executes the request and returns PluginResult.
     *
     * @param action        The action to execute.
     * @param args          JSONArry of arguments for the plugin.
     * @param callbackId    The callback id used when calling back into JavaScript.
     * @return              A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {
    	if (action.equals("getPath")) {
//    		return new PluginResult(PluginResult.Status.OK, Environment.getExternalStorageDirectory().getPath());
			Log.v(Tag, "getPath");
    		return new PluginResult(PluginResult.Status.OK, cordova.getActivity().getCacheDir().getPath());
		} else if (action.equals("getCouchPath")) {
			Log.v(Tag, "getCouchPath");
    		return new PluginResult(PluginResult.Status.OK, cordova.getActivity().getExternalFilesDir(null).getPath());
		} else {
		    return new PluginResult(PluginResult.Status.INVALID_ACTION);
		}
    }
}