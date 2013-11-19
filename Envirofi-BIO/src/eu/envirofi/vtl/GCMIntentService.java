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
  * @file src/GCMIntentService.java
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short IntentService responsible for handling GCM messages.
  */

package eu.envirofi.vtl;

import com.google.android.gcm.*;
import com.phonegap.plugins.CouchDBHostInfo;
import com.phonegap.plugins.GCMPlugin;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;


public class GCMIntentService extends GCMBaseIntentService {

  public static final String ME="GCMReceiver";

  public GCMIntentService() {
    super("320828036326");
  }
  
  private static final String TAG = "GCMIntentService";

  @Override
  public void onRegistered(Context context, String regId) {

    Log.v(ME + ":onRegistered", "Recieved registrationId from Google: " + regId);
    
    JSONObject json;
    
    try {
      json = new JSONObject().put("event", "registrationChange");
      json.put("regId", regId);
      json.put("regStatus", "on");
      GCMPlugin.sendJS( json );
      
    } catch( JSONException e) {
      Log.e(ME + ":onRegisterd", "JSON exception");
    }
  }

  @Override
  public void onUnregistered(Context context, String regId) {

	Log.d(TAG, "Unregister device with regId: " + regId);
    
    JSONObject json;
    try {
      json = new JSONObject().put("event", "registrationChange");
      json.put("regId", "");
      json.put("regStatus", "off");
      GCMPlugin.sendJS( json );

    } catch( JSONException e) {
      Log.e(ME + ":onAlreadyRegisterd", "JSON exception");
    }
    
  }

  @Override
  protected void onMessage(Context context, Intent intent) {
    Log.d(TAG, "onMessage - context: " + context);

    String action = intent.getAction();
	
	if ("com.google.android.c2dm.intent.RECEIVE".equals(action)) {          
        Log.d(TAG, "onMessage - content: " + intent.getStringExtra("content").toString());

    } else {
    	Log.d(TAG, "onMessage: no RECEIVE action detected!");
    }
	
	// check if app is turned on (use couchdb for this)
	if(CouchDBHostInfo.getHost().equals("")) {

		// app is off - spawn a notification
		GCMPlugin.spawnAndroidNotification(context, "Envirofi notification", context.getString(R.string.app_name), "You received a new notification!");
       
	} else {
		
		// app is on - forward notification to sencha touch 2
		JSONObject jsonReturn;
	    try {
	    	
	    	// extract "content" part of received payload 
	    	JSONObject jsonContent = new JSONObject(intent.getStringExtra("content").toString());
	    	
	    	// build jsonReturn (attatch an event type and add jsonContent
			jsonReturn = new JSONObject().put("event", "notificationReceived");
			jsonReturn.put("content", jsonContent);
			
			// build javascript callback function code to send jsonReturn to Sencha Touch 2
			String jsCall =  "javascript:GCM_catchNotification(" + jsonReturn.toString() + ")";
			
			// now generate an Intent and broadcast it. VTLActivity will catch it and execute the javascript code
			Intent gcmIntent = new Intent("eu.envirofi.vtl.GCM_NOTIFICATION");
			gcmIntent.putExtra("GCM_NOTIFICATION", jsCall);
			context.sendBroadcast(gcmIntent);
	
	    } catch( JSONException e) {
	      Log.e(ME + ":onMessage", "JSON exception");
	    }
    
	}

  }

  @Override
  public void onError(Context context, String errorId) {
    Log.e(TAG, "onError - errorId: " + errorId);
  }
  
  @Override
  public boolean onRecoverableError(Context context, String errorId) {
	  Log.e(TAG, "onRecoverableError - errorId : " + errorId);
	  return false;
  }




}
