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
  * @file app/view/AreaOfInterestDetail.js
  * @authors Hermann Huber, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha touch view object for display of the 
  *        details of an area of interest.
  *        
  */

Ext.define('treeapp.view.AreaOfInterestDetail', {
    extend: 'Ext.form.Panel',
    xtype : 'areaofinterestdetail',
    requires: ['treeapp.store.eventstore'],
    config: {
		title: '@treeapp.view.AreaOfInterestDetail.Title@',
        styleHtmlContent: true,
        scrollable: true,
		id : 'aoidetails',
	
		items: [
			{
				xtype: 'panel',
				id: 'aoidetail-container',
				title : 'aoidetail-container-title',
//				docked: 'top',
                layout: {
                    type: 'vbox',
                    align: 'middle'
                },
                style : {
						//'height' : '100px'
					},
				config: {
					styleHtmlContent : true,
					id : "aoidetailhtml"
			    },
			    listeners : {
			    	initialize : function() {
			    		this.objectsInAoI = AoI_countObjectsInArea(Ext.getCmp('aoidetails').getData());
			    		
			    		this.setHtml(AoI_getDetailViewHtml(this.objectsInAoI));
			    	}
			    }
			},
			{
				xtype: 'togglefield',
				name: 'active',
				label: '@treeapp.view.AreaOfInterestDetail.replicationLabel@',
				labelWidth: '45%',
				listeners: {
                    change: function () {
                    	
                    	var aoidata = Ext.getCmp('aoidetails').getData();
                    	var toggle = (this.getValue() == 1);
                        AoI_toggleReplication(aoidata, toggle);
                        
                    },
                    initialize : function() {
                    	var aoidata = Ext.getCmp('aoidetails').getData();
                    	this.setValue( (aoidata.active == "true" || aoidata.active == true) ? 1 : 0 );
                    }
                }
			},
			{
				xtype: 'button',
				itemId: 'jumptomap',
				name: 'jumptomap',
				text: '@treeapp.view.AreaOfInterestDetail.jumptoMap@',
				ui : 'confirm',
			    style : {
					'margin' : '5px',
					'padding' : '10px'
			    },
				listeners : {
			        tap : function() {
			        	var aoidata = Ext.getCmp('aoidetails').getData();
			        	AoI_jumpToMap(aoidata, null);
			        }
			    }
			},
			{
				xtype: 'button',
				itemId: 'refreshaoi',
				name: 'refreshaoi',
				text: '@treeapp.view.AreaOfInterestDetail.refreshButton@',
				//ui : 'confirm',
			    style : {
					'margin' : '5px',
					'padding' : '10px'
			    },
				listeners : {
			        tap : function() {
			        	var aoidata = Ext.getCmp('aoidetails').getData();
			            if(AoI_refresh(aoidata)) {
			            	Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.refreshMsgSuccess@', Ext.emptyFn);
			            } else {
			            	Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.refreshMsgFail@', Ext.emptyFn);
			            }
			        }
			    }
			},
			{
				xtype: 'button',
				itemId: 'refreshtiles',
				name: 'refreshtiles',
				text: '@treeapp.view.AreaOfInterestDetail.refreshTilesButton@',
				//ui : 'confirm',
			    style : {
					'margin' : '5px',
					'padding' : '10px'
			    },
				listeners : {
			        tap : function() {
                        Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.refreshMsgSuccess@', Ext.emptyFn);
			        	var aoidata = Ext.getCmp('aoidetails').getData();
			        	AoI_tiles_refresh(aoidata);
			        }
			    }
			},
			{
				xtype: 'button',
				itemId: 'deletetiles',
				name: 'deletetiles',
				text: '@treeapp.view.AreaOfInterestDetail.deleteTilesButton@',
				ui : 'decline',
			    style : {
					'margin' : '5px',
					'padding' : '10px'
			    },
				listeners : {
			        tap : function() {
			            Ext.Msg.confirm('', '@treeapp.view.AreaOfInterestDetail.deleteTilesQuestion@',function(buttonId, value, opt) {
			                if (buttonId == 'yes') {
			                    var aoidata = Ext.getCmp('aoidetails').getData();
		                        AoI_tiles_delete(aoidata);
			                }
			            });		        	
			        }
			    }
			},
			{
				xtype: 'button',
				itemId: 'deleteaoi',
				name: 'deleteaoi',
				text: '@treeapp.view.AreaOfInterestDetail.deleteButton@',
				ui : 'decline',
				padding : '10px',
			    margin : '5px',
				listeners : {
			        tap : function() {
			        	
			            var aoidata = Ext.getCmp('aoidetails').getData();

			        	if(AoI_delete(aoidata)) {
							Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.deleteMsgSuccess@', Ext.emptyFn);
							// get AoI-store
							var aoiStore = Ext.data.StoreManager.lookup('areaofintereststore');
							
							// did it work?
							if (aoiStore == undefined) {
							    console.log("AOI: aoiStore is undefined!");
							} else {

							    aoiStore.load();
				
							}
							Ext.getCmp('aoinavid').pop();
			            } else {
			            	Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.deleteMsgFail@', Ext.emptyFn);
			            }
			            
			            
			        }
				},
				hidden: true
			},
			{
				xtype: 'panel',
				name: 'eventpanel',
				id: 'eventpanel',
				layout: 'hbox',
				items: [
				    {
						xtype: 'selectfield',
						name: 'eventfilter',
						id: 'eventfilter',
						label: '@treeapp.view.AreaOfInterestDetail.eventFilterLabel@:',
                        labelWrap: true,
						options: [
							{text: '@treeapp.view.AreaOfInterestDetail.eventFilterAll@', value: 'all'},
							{text: '@treeapp.view.AreaOfInterestDetail.eventFilterNew@', value: 'new'}
						],
				    	flex: 1,
				    	usePicker: false,
				    	listeners: {
		                    change: function () {
								var eventstore = Ext.data.StoreManager.lookup('eventstore');
		                    	if (this.getValue() == 'all') {
		                    		eventstore.clearFilter(false);
		                    	}
		                    	else {
		                    		eventstore.filterBy(function (item) {
		                    			var retval = !(item.get('visited') && item.get('visited') == 'true') && !(item.get('expired') && item.get('expired') == 'true');
		            					return retval;
		            				});	
		                    	}
		                    }
			            }
				    },
				    {
						xtype: 'selectfield',
						name: 'eventsort',
						id: 'eventsort',
						label: '@treeapp.view.AreaOfInterestDetail.eventSortLabel@:',
                        labelWrap: true,
						options: [
							{text: '@treeapp.view.AreaOfInterestDetail.eventSortCreated@ ^', value: 'created_asc'},
							{text: '@treeapp.view.AreaOfInterestDetail.eventSortCreated@ v', value: 'created_desc'},
							{text: '@treeapp.view.AreaOfInterestDetail.eventSortDistance@ ^', value: 'distance_asc'},
							{text: '@treeapp.view.AreaOfInterestDetail.eventSortDistance@ v', value: 'distance_desc'},
							{text: '@treeapp.view.AreaOfInterestDetail.eventSortVisited@', value: 'visited'}
						],
				    	flex: 1,
				    	usePicker: false,
				    	listeners: {
		                    change: function () {				                    	
		                    	var eventstore = Ext.data.StoreManager.lookup('eventstore');
		                    	if (this.getValue() == 'created_asc') {
									eventstore.sort(new Ext.util.Sorter({
										property : 'created',
										direction: 'ASC',
										sorterFn: dateSorter
									}));
		                    	}
		                    	else if (this.getValue() == 'created_desc') {
									eventstore.sort(new Ext.util.Sorter({
										property : 'created',
										direction: 'DESC',
										sorterFn: dateSorter
									}));
		                    	}
		                    	else if (this.getValue() == 'distance_asc') {
									eventstore.sort('distance', 'ASC');
		                    	}
		                    	else if (this.getValue() == 'distance_desc') {
									eventstore.sort('distance', 'DESC');
		                    	}
		                    	else if (this.getValue() == 'visited') {
		                    		eventstore.sort('visited');
		                    	}
		                    }
			            }
				    }
			    ],
				listeners : {
			        tap : function() {
			        	
			            var aoidata = Ext.getCmp('aoidetails').getData();

			        	if(AoI_delete(aoidata)) {
							Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.deleteMsgSuccess@', Ext.emptyFn);
							// get AoI-store
							var aoiStore = Ext.data.StoreManager.lookup('areaofintereststore');
							
							// did it work?
							if (aoiStore == undefined) {
							    console.log("AOI: aoiStore is undefined!");
							} else {

							    aoiStore.load();
				
							}
							Ext.getCmp('aoinavid').pop();
			            } else {
			            	Ext.Msg.alert('Info', '@treeapp.view.AreaOfInterestDetail.deleteMsgFail@', Ext.emptyFn);
			            }
			        }
				},
				hidden : false
			},
			{
				xtype:'list',
				id : 'aoidetail-eventlist',
//				layout : "fit",
				scrollable : false,
				flex : 1,
				ui : "round",
				store : 'eventstore',
				itemTpl : new Ext.XTemplate(
					'<tpl if="visited == \'true\'">',
						'<div>',
							'<img src="{iconurl}" style="position:absolute; width:3em; margin-left:0.1em;" />',
							'<div style="position:relative; left:3.7em; width:75%; line-height:1em;">',
								'<span style="font-size:1.2em;"><b>{heading}</b></span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#333;">{provider}</span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#555;">{text}</span>',
							'</div>',
	        			'<div>',
					'<tpl elseif="expired == \'true\'">',
						'<div>',
							'<img src="{iconurl}" style="position:absolute; width:3em; margin-left:0.1em;" />',
							'<div style="position:relative; left:3.7em; width:75%; line-height:1em;">',
								'<span style="font-size:1.2em;color:grey;"><b>{heading}</b></span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#333;">{provider}</span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#555;">{text}</span>',
							'</div>',
		    			'<div>',
					'<tpl else>',
						'<div>',
							'<img src="{iconurl}" style="position:absolute; width:3em; margin-left:0.1em;" />',
							'<div style="position:relative; left:3.7em; width:75%; line-height:1em;">',
								'<span style="font-size:1.2em;color:red;"><b>{heading}</b></span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#333;">{provider}</span></br>',
								'<span style="font-size:0.8em; margin-bottom:5em; color:#555;">{text}</span>',
							'</div>',
		    			'<div>',
	            	'</tpl>'
        		),
				listeners: {
					/**
					 * Called whenever list is painted on the screen 
					 */
					painted:{
						fn : function() {
							
							// retrieve particular AoI data
							var aoidata = Ext.getCmp('aoidetails').getData();
							var aoidoc = userDB.getDoc(aoidata._id);
							
							var bbox = {
								left : aoidoc.aoi.bbox.geometry.coordinates[0][0],
								bottom : aoidoc.aoi.bbox.geometry.coordinates[0][1],
								right : aoidoc.aoi.bbox.geometry.coordinates[1][0],
								top : aoidoc.aoi.bbox.geometry.coordinates[2][1]
							}
							
							var bboxParameter = "bbox="+bbox.left+","+bbox.bottom+","+bbox.right+","+bbox.top;
							console.log("URL: " + getCouchURL() + getCouchDBDatabasename() + "/_design/events/_spatial/_list/eventsdata/activeevents?" + bboxParameter);
							
							// load suitable events from database
							var response = Ext.Ajax.request({
							    //url: getCouchURL() + getCouchDBDatabasename() + "/_design/events/_list/eventsdata/activeevents?idAoI=" + aoidata._id,
								url : getCouchURL() + getCouchDBDatabasename() + "/_design/events/_spatial/_list/eventsdata/activeevents?" + bboxParameter,
							    async : false,
							    success: function(response){ /* do nothing -> it is sync! */  },
							    failure:function(response, opts){
									console.log("LOAD ERROR: Could not load event documents!" + response.request.options.url);
								}
							});
							
							// collect events in data-array to be pushed to store
							var events = JSON.parse(response.responseText);
							var data = [];
							
							var currentPos = new LatLon(currentPosition.lat, currentPosition.lon);
							console.log("currentPos = " + JSON.stringify(currentPos));
							for(i=0; i<events.length; i++) {
								
								var icon = "";
								
								// try to determine the icon. if not possible use default icon.
								if(events[i].properties.icon.url) {
									icon = events[i].properties.icon.url;
								} else if(events[i].properties.icon.file) {
									icon = getCouchURL() + getCouchDBDatabasename() + "/" + events[i]._id + "/" + events[i].properties.icon.file;
								} else {
									icon = "img/envirofi.png";
								}
								
								// the properties of this array match the fields defined in the eventstore
								var visited = 'false';
								if (events[i].visited && events[i].visited == 'true') {
									visited = 'true';
								}
								var created = new Date(events[i].timestamps.created);
								var coord = new LatLon(events[i].properties.geometry.coordinates[1], events[i].properties.geometry.coordinates[0]);
								console.log("vor distance: coord = " + JSON.stringify(coord));
								var dist = currentPos.distanceTo(coord, 8);
								console.log("nach distance: dist = " + dist);
								// calculate distance to current position:
								var temp = {
									"_id" : events[i]._id,
									"heading" : events[i].properties.label,
									"provider" : "by " + events[i].properties.provider,
									"text" : formatTimeSpan(new Date(Date.parse(events[i].timestamps.created))) + " ago",
									"iconurl" : icon,
									"visited" : visited,
									"created" : created,
									"expired" : 'false',
									"distance": dist
								}
								console.log("data[" + i + "] = " + JSON.stringify(data));
								data.push(temp);
							}
							// push data to eventstore -> list updates and renders accordingly
							var eventstore = Ext.data.StoreManager.lookup('eventstore');
							console.log("vor setData");
							eventstore.setData(data);
							console.log("nach setData");
							eventstore.sort(new Ext.util.Sorter({
								property : 'created',
								direction: 'ASC',
								sorterFn: dateSorter
							}));
							console.log("nach sort");
							if (events.length <= 0) {
								// no events available => hide filter and sorter fields:
								Ext.getCmp('eventpanel').setHidden(true);
							}
							else {
								// events available => show filter and sorter fields:
								Ext.getCmp('eventpanel').setHidden(false);
							}
							for (k = 0; k < eventstore.getCount(); k++) {
								var o = eventstore.getAt(k);
								console.log("Nach Sort: data[" + k + "] = " + o.getData().created);
							}
						},
						scope: this
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
						var aoidata = Ext.getCmp('aoidetails').getData();
			        	AoI_jumpToMap(aoidata, treeDetailsId);								
					}
				}
			}
		]
	 }
});

function dateSorter(o1, o2) {
	var v1 = new Date(o1.data.created);
	var v2 = new Date(o2.data.created);
	return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
} 




