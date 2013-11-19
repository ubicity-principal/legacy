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
  * @file src/VTLActivity.java
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short Base class for Android mobile application.
  */

package eu.envirofi.vtl;


import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

import com.phonegap.*;
import com.phonegap.plugins.CouchDBHostInfo;
import com.couchbase.android.CouchbaseMobile;
import com.couchbase.android.ICouchbaseDelegate;

import org.apache.cordova.DroidGap;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.DbAccessException;
import org.ektorp.DbPath;
import org.ektorp.ReplicationCommand;
import org.ektorp.android.http.AndroidHttpClient;
import org.ektorp.http.HttpClient;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.impl.StdCouchDbInstance;

import org.ektorp.android.util.EktorpAsyncTask;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;

@SuppressWarnings("unused")
public class VTLActivity  extends DroidGap {
	
	//couch internals
	private ServiceConnection couchServiceConnection;
	protected static HttpClient httpClient;
	
	//ektorp impl
	protected CouchDbInstance dbInstance;
	protected CouchDbConnector couchDbConnector;
	/*protected ReplicationCommand pushReplicationCommand;
	protected ReplicationCommand pullReplicationCommand; */
	
	protected static final String LOG_TAG = "CouchDB";
	
	// BroadcastReceiver - catches javascript notification from GCMIntentService
	private final BroadcastReceiver mHandleMessageReceiver =
            new BroadcastReceiver() {
		
			        @Override
			        public void onReceive(Context context, Intent intent) {

			        	// extract the javascript code
			        	Log.d(LOG_TAG, "MESSAGE RECEIVED ...");
			            String jsCall = intent.getExtras().getString("GCM_NOTIFICATION");
			            Log.d(LOG_TAG, "MESSAGE RECIEVED: " + jsCall);
			            
			            // execute the javascript code
			            appView.getSettings().setJavaScriptEnabled(true);
			    		appView.loadUrl(jsCall);
			        }
			        
    };

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {

		Log.d(LOG_TAG, "Start Application ...");
		super.onCreate(savedInstanceState);
		super.loadUrl("file:///android_asset/www/tree-test.html");

		SharedPreferences sharedPrefs = getSharedPreferences("envirofiSharedPrefs", 0);
		sharedPrefs.edit().putString("sdcardPath", Environment.getExternalStorageDirectory().getPath()).commit();

		Log.d(LOG_TAG, Environment.getExternalStorageDirectory().getPath());

		
		Log.d(LOG_TAG, "CouchDB will be started.");
		CouchbaseMobile couch = new CouchbaseMobile(getBaseContext(), mDelegate);
		couchServiceConnection = couch.startCouchbase(); 
		
		this.appView.addJavascriptInterface(
			 new Console(), "console"
		);
		
		// register the braodcast receiver in order to catch javascript calls from GCMIntentService.onMessage()
		registerReceiver(mHandleMessageReceiver, new IntentFilter("eu.envirofi.vtl.GCM_NOTIFICATION"));
		// do not allow switching between portrait and landscape orientation:
		this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
	}
    
	public void onDestroy() {
		Log.v(LOG_TAG, "Service to CouchDB will be unbound.");
		
		// unregister notification broadcastreceiver
		unregisterReceiver(mHandleMessageReceiver);

		//stopEktorp();
		unbindService(couchServiceConnection);
		super.onDestroy();
	}
    
    
    private final ICouchbaseDelegate mDelegate = new ICouchbaseDelegate() {
    	public void couchbaseStarted(String host, int port) {
    		Log.i(LOG_TAG, "Couchbase has started " + host + ":" + port);
    		CouchDBHostInfo.setCouchDB(host, port);
    		//startEktorp(host, port);    		
    	}

    	public void exit(String error) {
    	}
	};
	
//	protected void startEktorp(String host, int port) {
//		Log.v(TAG, "starting ektorp");
//		
//		if(httpClient != null) {
//			httpClient.shutdown();
//		}
//
//		
//		httpClient = new AndroidHttpClient.Builder()
//				.host(host).port(port).maxConnections(100).build();
//		
//		dbInstance = new StdCouchDbInstance(httpClient);
//		
//	}
//	
//	protected void stopEktorp() {
//		//clean up our http client connection manager
//    	if(httpClient != null) {
//    		httpClient.shutdown();
//    	}
//		
//	}

}