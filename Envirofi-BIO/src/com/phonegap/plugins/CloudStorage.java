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
  * @file src/CloudStorage.java
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Android Phonegap plugin for uploading and downloading files from/to the 
  *        mobile phone's file system to/from FI-Ware Cloud Storage GE
  */

package com.phonegap.plugins;

import java.io.File;
import java.io.FileInputStream;
import java.net.URI;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;

public class CloudStorage extends Plugin {
	
	public static final String LOG_TAG = "PhoneGap.Plugin.CloudStorage";
	
	protected static final String ACTION_UPLOAD = "uploadFile";
	protected static final String ACTION_STORE = "storeFile";
	
	/**
     * Executes the request and returns PluginResult.
     *
     * @param action        The action to execute.
     * @param data          JSONArry of arguments for the plugin.
     * 						'url': server url for upload
     * 						'file URI': URI of file to upload
    * 						'X-Auth-Token': authentication header to use for this request
     * @param callbackId    The callback id used when calling back into JavaScript.
     * @return              A PluginResult object with a status and message.
     * 
     */	
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		if (ACTION_UPLOAD.equals(action) || ACTION_STORE.equals(action)) {
			 try {
				 String serverUrl = data.get(0).toString();
				 String imageURI = data.getString(1).toString();
				 String token = null;
				 if (ACTION_UPLOAD.equals(action)) {
					 token = data.getString(2).toString();
				 }

				 File file = new File(new URI(imageURI));
				 try {
				     HttpClient httpclient = new DefaultHttpClient();

				     HttpPut httpput = new HttpPut(serverUrl);

				     InputStreamEntity reqEntity = new InputStreamEntity(
				             new FileInputStream(file), -1);
				     if (ACTION_UPLOAD.equals(action)) {
					     reqEntity.setContentType("binary/octet-stream");
					     reqEntity.setChunked(true); // Send in multiple parts if needed
				     }
				     else {
				    	 reqEntity.setContentType("image/jpg");
				     }
				    
				     httpput.setEntity(reqEntity);
				     if (token != null) {
				    	 httpput.addHeader("X-Auth-Token", token);
				     }
				     
				     HttpResponse response = httpclient.execute(httpput);
				     Log.d(LOG_TAG, "http response: " + response.getStatusLine().getStatusCode() + response.getStatusLine().getReasonPhrase());
				     //Do something with response...
				     result = new PluginResult(Status.OK, response.getStatusLine().getStatusCode());
				 } catch (Exception e) {
					 Log.d(LOG_TAG, e.getLocalizedMessage());
					 result = new PluginResult(Status.ERROR);
				 }
			} catch (JSONException e) {
				Log.d(LOG_TAG, e.getLocalizedMessage());
				result = new PluginResult(Status.JSON_EXCEPTION);				
			} catch (Exception e1) {
				Log.d(LOG_TAG, e1.getLocalizedMessage());
				result = new PluginResult(Status.ERROR);
			}		 
		}
		return result;
	}
}

