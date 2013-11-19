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
  * @file src/GCMPlugin.java
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short Android Phonegap plugin for Google Cloud Messaging (GCM)
  */

package com.phonegap.plugins;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gcm.GCMRegistrar;

import eu.envirofi.vtl.R;
import eu.envirofi.vtl.VTLActivity;

public class GCMPlugin extends Plugin {

  public static final String Tag="GCMPlugin";

  public static final String REGISTER="register";
  public static final String UNREGISTER="unregister";
  public static final String NOTIFY = "notify";

  public static Plugin gwebView;
  public static String gECB;
  
  private static String gSenderID = "320828036326";
  
  public GCMPlugin() {
	  gwebView = this;
  }

  //@SuppressWarnings("deprecation")
  @Override
  public PluginResult execute(String action, JSONArray data, String callbackId)
  {

    PluginResult result = null;

    Log.v(Tag + ":execute", "action=" + action);
    
    /******************************************************************
     * Event == REGISTER
     ******************************************************************/
    if (REGISTER.equals(action)) {

      Log.v(Tag + ":Register", "data=" + data.toString());

      try {

        JSONObject jo= new JSONObject(data.toString().substring(1, data.toString().length()-1));

        gwebView = this;
        gECB = (String)jo.get("ecb");

        Log.v(Tag + ":execute", "ECB="+gECB+" senderID="+gSenderID );

        // check if device and manifest are configured accordingly
        GCMRegistrar.checkDevice(cordova.getActivity().getApplicationContext());
        GCMRegistrar.checkManifest(cordova.getActivity().getApplicationContext());
        
        // check if device is already registered!
        final String regId = GCMRegistrar.getRegistrationId(cordova.getActivity().getApplicationContext());
        
        
        Log.v(Tag + ":status", "regid: " +  regId );
        Log.v(Tag + ":status", "is registered: " +  GCMRegistrar.isRegistered(cordova.getActivity().getApplicationContext()) );
        Log.v(Tag + ":status", "is registered on server: " +  GCMRegistrar.isRegisteredOnServer(cordova.getActivity().getApplicationContext()) );
        
        if (regId.equals("")) {
        
        	GCMRegistrar.register(cordova.getActivity().getApplicationContext(), "320828036326");
        	Log.v(Tag, "Device is not registered. Initiated registration.");
        	
        } else {
        	
          Log.v(Tag, "Device already registered with regId " + regId);
                            
          JSONObject json;
          try {
            json = new JSONObject().put("event", "registrationChange");
            json.put("regId", regId);
            json.put("regStatus", "on");
            GCMPlugin.sendJS( json );
            
          } catch( JSONException e) {
            Log.e(Tag + ":onAlreadyRegisterd", "JSON exception");
          }
          
        }

        result = new PluginResult(Status.OK);

      }
      catch (JSONException e) {
        Log.e(Tag, "Got JSON Exception " + e.getMessage());
        result = new PluginResult(Status.JSON_EXCEPTION);
      }
    }
    /******************************************************************
     * Event == UNREGISTER
     ******************************************************************/
    else if (UNREGISTER.equals(action)) {
    	
    	Log.v(Tag + ":Unregister", "data=" + data.toString());

        try {
          JSONObject jo= new JSONObject(data.toString().substring(1, data.toString().length()-1));

          gwebView = this;
          gECB = (String)jo.get("ecb");

          Log.v(Tag + ":execute", "ECB="+gECB );
          
          Log.v(Tag + ":status", "is registered: " +  GCMRegistrar.isRegistered(cordova.getActivity().getApplicationContext()) );
          Log.v(Tag + ":status", "is registered on server: " +  GCMRegistrar.isRegisteredOnServer(cordova.getActivity().getApplicationContext()) );
         
          
	      GCMRegistrar.unregister(cordova.getActivity().getApplicationContext());
	      Log.v(Tag + ":" + UNREGISTER, "Initiated unregistration of device");
	      
	      result = new PluginResult(Status.OK);
	      
        } catch (JSONException e) {
          Log.e(Tag, "Got JSON Exception " + e.getMessage());
          result = new PluginResult(Status.JSON_EXCEPTION);
        }

    }
    /******************************************************************
     * Event == NOTIFY
     ******************************************************************/
    else if(NOTIFY.equals(action)) {
    	
    	// spawn android notification at phone
    	
    	try {
    		
    		JSONObject jo= new JSONObject(data.toString().substring(1, data.toString().length()-1));
    		
    		String notificationTitleTop = "Envirofi notification";
    		String notificationTitle = cordova.getActivity().getApplicationContext().getString(R.string.app_name);
    		String notificationText = (String)jo.get("notification");
    		
	        spawnAndroidNotification(cordova.getActivity().getApplicationContext(), notificationTitleTop, notificationTitle, notificationText);
	        
	        result = new PluginResult(Status.OK);
        
    	} catch (JSONException e) {
            Log.e(Tag, "Got JSON Exception " + e.getMessage());
            result = new PluginResult(Status.JSON_EXCEPTION);
         }
    
    }
    
    
    /******************************************************************
     * Event == *INVALID*
     ******************************************************************/
    else
    {
      result = new PluginResult(Status.INVALID_ACTION);
      Log.e(Tag, "Invalid action : "+action);
    }

    return result;
  }


  public static void sendJS( JSONObject _json)
  {
    String _d =  "javascript:"+gECB+"(" + _json.toString() + ")";
        Log.v(Tag + ":sendJavascript", _d);

        if (gECB != null ) {
          gwebView.sendJavascript( _d );
          
        }
  }
  
  public static void spawnAndroidNotification(Context context, String titleTop, String title, String text) {
	  
	  long when = System.currentTimeMillis();
	  
	  NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      Notification notification = new Notification(R.drawable.envirofi, titleTop, when);
      Intent notificationIntent = new Intent(context, VTLActivity.class);
      // set intent so it does not start a new activity
      notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
      PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, notificationIntent, 0);
      notification.setLatestEventInfo(context, title, text, pendingIntent);
      notification.flags |= Notification.FLAG_AUTO_CANCEL;
      notificationManager.notify(0, notification);
      
  }
  


}
