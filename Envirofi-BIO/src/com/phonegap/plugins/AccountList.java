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
  * @file src/AccountList.java
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Phonegap plugin for retrieving and handling Android phone accounts
  */

package com.phonegap.plugins;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.util.Log;

public class AccountList extends Plugin {
	
	public static final String Tag="AccountList";
	
	private static String[] accountTypes={"com.google", "com.facebook.auth.login", "com.twitter.android.auth.login", "com.yahoo.mobile.client.share.sync", "com.linkedin.android", "com.skype.contacts.sync"};
	private static String[] accountTypeNames={"Google", "Facebook", "Twitter", "Yahoo", "LinkedIn", "Skype"};

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
	
		try {
			
			AccountManager am = AccountManager.get(cordova.getActivity());
			
			Account[] accounts;
			JSONArray res = new JSONArray();
			JSONObject aJSON = null;
			JSONArray idsJSON = null;
			for (int j = 0; j < accountTypes.length; j++) {
				accounts = am.getAccountsByType(accountTypes[j]);				
				if (accounts.length > 0) {
					aJSON = new JSONObject();
					idsJSON = new JSONArray();
					aJSON.put("type", accountTypeNames[j]);
					for (int i = 0; i < accounts.length; i++) {
						Account a = accounts[i];
						Log.d(Tag, "Account name/type: " + a.name + "/" + a.type);
						idsJSON.put(a.name);
					}
					aJSON.put("ids", idsJSON);
					res.put(aJSON);
				}
			}
			// demo accounts:
			aJSON = new JSONObject();
			idsJSON = new JSONArray();
			aJSON.put("type", "Demo");
			idsJSON.put("demouser1");
			idsJSON.put("demouser2");			
			aJSON.put("ids", idsJSON);
			res.put(aJSON);
			
			return new PluginResult(PluginResult.Status.OK, res);
			
			} catch (JSONException e) {
				Log.v(Tag, e.toString());
				return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
			}
		}
}