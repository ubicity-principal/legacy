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
  * @file app/view/MainMenu.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the main menu of the application.
  */
Ext.define('treeapp.view.MainMenu', {
    extend: 'Ext.Container',
    xtype: 'vtlmainmenu',
	requires: ['treeapp.view.Panel', 'treeapp.view.NewTree', 'treeapp.view.Settings', 'treeapp.view.AreaOfInterestNavigation', 'treeapp.store.currenteventsstore'],
    config: {
		id: 'vtlmainmenu',
		padding: 0,
		fullscreen: true,
		layout: {
			type: 'vbox',
			pack: 'center',
			align: 'stretch'
		},
		defaults: {
			margin: 10,
			ui: 'round'
		},
        items: [
			{
				xtype: 'container',
				html: '<div class="vtlheading">@treeapp.view.MainMenu.Title@</div>'
			},
            {
                xtype: 'button',
                text: '@treeapp.view.MainMenu.ListObservationsButton@',
				padding: 10,
                id: 'listobservations'
            },
			{
				xtype: 'button',
				text: '@treeapp.view.MainMenu.ReportObservationsButton@',
				id: 'reportobservations',
				padding: 10,
				hidden: true
			},
			{
				xtype: 'button',
				text: '@treeapp.view.MainMenu.SettingsButton@',
				padding: 10,
				id: 'settings'
			},
			{
				xtype: 'button',
				text: '@treeapp.view.MainMenu.AreasButton@',
				padding: 10,
				id: 'areasofinterestBtn'
			},
			{
				xtype: 'panel',
				name: 'mainmenu_eventpanel',
				id: 'mainmenu_eventpanel',
				flex: 1,
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				padding: 0,
				items: [
				    {
				    	xtype: 'label',
				        html: '@treeapp.view.MainMenu.Events@'
				    },
			        {
						xtype:'list',
						id : 'mainmenueventlist',
						scrollable : true,
						flex: 1,
						ui : "round",
						store : 'currenteventsstore',
						styleHtmlContent : true,
						itemTpl : new Ext.XTemplate(
								'<div>',
									'<img src="{iconurl}" style="position:absolute; width:3em; margin-left:0.1em;" />',
									'<div style="position:relative; left:3.7em; width:75%; line-height:1em;">',
										'<span style="font-size:1.2em;color:red;"><b>{heading}</b></span></br>',
										'<span style="font-size:0.8em; margin-bottom:5em; color:#333;">{provider}</span></br>',
										'<span style="font-size:0.8em; margin-bottom:5em; color:#555;">{text}</span>',
									'</div>',
				    			'<div>'
		        		),
						listeners: {
							painted : function() {
								console.log("list painted");
								var eventstore = Ext.data.StoreManager.lookup('currenteventsstore');
								for (k = 0; k < eventstore.getCount(); k++) {
									var o = eventstore.getAt(k);
									console.log("in Painted: data[" + k + "] = " + o.getData().iconurl);
								}
		
							},
							/**
							 * Called whenever the user tabs on an event in the list
							 */
							itemtap : function(that, index, target, record, e , eOpts) {
								// retrieve the respective event document from db 
								var eventDocId = record.getData()._id;
								var event = userDB.getDoc(eventDocId);
								
								console.log("eventDoc: " + JSON.stringify(event));
								console.log("EventType = " + event.properties.eventType);
								event.visited = 'true';
								userDB.putDoc(event);
								var treeDetailsId = null;
								if (event.properties.eventType == "newTree") {
									treeDetailsId = event.properties.id;
								}
								else if (event.properties.eventType == "newObservation") {
									var obs = userDB.getDoc(event.properties.id);
									treeDetailsId = obs.treeid;
								}
								if(hasInternetConnection()){
								    setUseCachedMaps(null, treeDetailsId);
								} else {
									Ext.Msg.alert('', "@treeapp.controller.Main.offlineMaps.Msg@");
								  	Ext.getCmp('vtlmainpanel').setActiveItem(1);
								  	menuState = 'inMainNavigation';
								  	showTreeMap("treemap", "commontreestore", 0, null, treeDetailsId);
							   }
							   updateEventStore();
							   that.deselect(that.getSelectedRecords());
							   that.refresh();
							}
			        	}
					}
			    ]
			}
		],
    }
});


