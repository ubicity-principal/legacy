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
		//title: '@treeapp.view.Settings.Title@',
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
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.UserNameLabel@</div>',
					disabled: true
				},
				{
					xtype: 'checkboxfield',
					id: 'settingsgps',
					name: 'usegps',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.useGPSLabel@</div>',
					value: true,
					checked: true
				},
				{
					xtype: 'textfield',
					id: 'settingsdefaultlon',
					name: 'defaultlon',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.LonLabel@</div>',
					hidden: true
				},
                {
                    xtype: 'textfield',
                    id: 'settingsdefaultlat',
                    name: 'defaultlat',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.LatLabel@</div>',
                    hidden: true
                },
                {
                    xtype: 'textfield',
                    id: 'settingsdefaultalt',
                    name: 'defaultalt',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.AltLabel@</div>',
                    hidden: true
                },
				{
					xtype: 'selectfield',
					name: 'mapsource',
					id: 'mapsourcefield',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.MapSourceLabel@</div>',
					options: [
						{text: '@treeapp.view.Settings.OSMSourceLabel@', value: 'OSM'},
						{text: '@treeapp.view.Settings.WMSSourceLabel@', value: 'WMS'},
						{text: '@treeapp.view.Settings.WMTSSourceLabel@', value: 'WMTS'}
					]/*,
					hidden: true	*/
				},
                {
                    xtype: 'checkboxfield',
                    id: 'settingspublish',
                    name: 'publish',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.publishLabel@</div>',
                    value: false,
                    checked: false
                },
                {
                    xtype: 'checkboxfield',
                    id: 'settingsgcm',
                    name: 'useGcm',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.gcmLabel@</div>',
                    //value: false,
                    //checked: false,
                    hidden: false
                },
                {
                    xtype: 'checkboxfield',
                    id: 'settingsuselocalmaps',
                    name: 'useLocalMaps',
					label: '<div style="width:100%;white-space:normal;">@treeapp.controller.Main.useCachedMaps.Msg.Answer.Local@</div>',
                    //value: false,
                    //checked: false,
                    hidden: false
                },
                {
                    xtype: 'numberfield',
                    id: 'settingseventcount',
                    name: 'mainMenuEventCount',
					label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.mainMenuEventCount@</div>',
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
							label: '<div style="width:100%;white-space:normal;">@treeapp.view.Settings.loglevel@</div>',
	                        labelWrap: true,
							options: [
								{text: '@treeapp.view.Settings.log.error@', value: 'error'},
								{text: '@treeapp.view.Settings.log.warn@', value: 'warning'},
								{text: '@treeapp.view.Settings.log.info@', value: 'info'},
								{text: '@treeapp.view.Settings.log.debug@', value: 'debug'}
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
				                    text: '<span>@treeapp.view.Settings.uploadLogfile1@</span><br><span>@treeapp.view.Settings.uploadLogfile2@</span>',
				                    ui: 'action'
				                },
				                { xtype: 'spacer' },
				                {
				                    xtype: 'button',
				                    itemId: 'restartreplication',
				                    text: '<span>@treeapp.view.Settings.replicate1@</span><br><span>@treeapp.view.Settings.replicate2@</span>',
				                    ui: 'action'
				                }
			                ],
	    			    }
	                ]
                },
                {
                    xtype: 'button',
                    itemId: 'deleteAllTiles',
                    text: '@treeapp.view.Settings.deleteAllTiles@',
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
					text: '@treeapp.view.Settings.saveSettingsButtonLabel@',
					ui: 'round'
				}
			]
		}
	]
    }
});
