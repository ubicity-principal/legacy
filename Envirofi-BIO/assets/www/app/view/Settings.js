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
  * @file app/view/Settings.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2012
  * @short This file defines the settings dialog of the application.
  */

Ext.define('treeapp.view.Settings', {
	extend: 'Ext.form.Panel',
	xtype: 'treeappsettings',

	config: {
		//title: 'Settings',
		styleHtmlContent: true,
		scrollable: true,
		//style: 'text-align: center',
		id: 'treeappsettings-form',
		items: [
		{
			xtype: 'fieldset',
			items: [
				{
					xtype: 'textfield',
					name: 'username',
					label: '<div style="width:100%;white-space:normal;">User Name</div>',
					disabled: true
				},
				{
					xtype: 'checkboxfield',
					id: 'settingsgps',
					name: 'usegps',
					label: '<div style="width:100%;white-space:normal;">Use GPS Sensor</div>',
					value: true,
					checked: true
				},
				{
					xtype: 'textfield',
					id: 'settingsdefaultlon',
					name: 'defaultlon',
					label: '<div style="width:100%;white-space:normal;">Default Longitude</div>',
					hidden: true
				},
                {
                    xtype: 'textfield',
                    id: 'settingsdefaultlat',
                    name: 'defaultlat',
					label: '<div style="width:100%;white-space:normal;">Default Latitude</div>',
                    hidden: true
                },
                {
                    xtype: 'textfield',
                    id: 'settingsdefaultalt',
                    name: 'defaultalt',
					label: '<div style="width:100%;white-space:normal;">Default Altitude</div>',
                    hidden: true
                },
				{
					xtype: 'selectfield',
					name: 'mapsource',
					id: 'mapsourcefield',
					label: '<div style="width:100%;white-space:normal;">Select Map</div>',
					options: [
						{text: 'Open Street Map', value: 'OSM'},
						{text: 'Tuscany Aerial Map', value: 'WMS'},
						{text: 'Vienna Aerial Map', value: 'WMTS'}
					]/*,
					hidden: true	*/
				},
                {
                    xtype: 'checkboxfield',
                    id: 'settingspublish',
                    name: 'publish',
					label: '<div style="width:100%;white-space:normal;">Publish new observations</div>',
                    value: false,
                    checked: false
                },
                {
                    xtype: 'checkboxfield',
                    id: 'settingsgcm',
                    name: 'useGcm',
					label: '<div style="width:100%;white-space:normal;">Google Notifications</div>',
                    //value: false,
                    //checked: false,
                    hidden: false
                },
                {
                    xtype: 'checkboxfield',
                    id: 'settingsuselocalmaps',
                    name: 'useLocalMaps',
					label: '<div style="width:100%;white-space:normal;">Use Local Maps</div>',
                    //value: false,
                    //checked: false,
                    hidden: false
                },
                {
                    xtype: 'numberfield',
                    id: 'settingseventcount',
                    name: 'mainMenuEventCount',
					label: '<div style="width:100%;white-space:normal;">Events in Main Menu</div>',
                    //value: false,
                    //checked: false,
                    hidden: false
                },
                {
                	xtype: 'panel',				
	    			layout: {
	    				type: 'vbox',
	    			},
	    			padding: 7,
	    			items: [
	    			    {
							xtype: 'selectfield',
							name: 'loglevel',
							id: 'loglevel',
							label: '<div style="width:100%;white-space:normal;">Log Level</div>',
	                        labelWrap: true,
							options: [
								{text: 'Error', value: 'error'},
								{text: 'Warning', value: 'warning'},
								{text: 'Info', value: 'info'},
								{text: 'Debug', value: 'debug'}
							],
					    	usePicker: false
	    			    },
	    			    {
		                	xtype: 'panel',				
			    			layout: {
			    				type: 'hbox',
			    				pack: 'center'
			    			},
			    			padding: 7,
			    			margin: 10,
			    			items: [
				                {
				                    xtype: 'button',
				                    itemId: 'uploadLogfile',
				                    text: '<span>Upload</span><br><span>Report</span>',
				                    ui: 'action'
				                },
				                { xtype: 'spacer' },
				                {
				                    xtype: 'button',
				                    itemId: 'restartreplication',
				                    text: '<span>Restart</span><br><span>Synchronization</span>',
				                    ui: 'action'
				                }
			                ],
	    			    }
	                ]
                },
                {
                    xtype: 'button',
                    itemId: 'deleteAllTiles',
                    text: 'Delete Cached Maps',
                    ui: 'decline'
                }
			]
		},
		{
			xtype: 'panel',				
			docked: 'bottom',
			layout: {
				type: 'vbox',
				align: 'middle',
			},
			style: 'background-color: black;',
			padding: 7,
			items: [
				{
					xtype: 'button',
					itemId: 'savesettingsbutton',
					text: 'Save Settings',
					ui: 'round'
				}
			]
		}
	]
    }
});
