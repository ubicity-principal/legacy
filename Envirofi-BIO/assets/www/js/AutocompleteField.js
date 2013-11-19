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
  * @file js/AutocompleteField.js
  * @authors Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short A GUI element that enables key-value pair lookup from vocabulary. 
  *        In case of this prototype: (key,value) = (uri,label).
  */
 Ext.define('Ext.AutocompleteField', {
	extend: 'Ext.field.Search',
	xtype: 'autocompletefield',
	config: {
		component: {
			xtype: 'input',
			type: 'text'		
		},
	},
	// returns true if label is found in the vocabulary
	didFindLabel: function() {
		var json = this.getItemFromVocabulary();
		//if(json) return true; else return false;
		return (json);
	},
	// returns the uri to the corresponding label
	getUri: function() {
		var json = this.getItemFromVocabulary();
		//if(json) return json.uri; else return null;
		return (json) ? json.uri : null;
	},
	// returns the label; if given label from searchfield doesn't map to a uri, return null
	getLabel: function() {
		var json = this.getItemFromVocabulary();
		//if(json) return json.label; else return null;
		return (json) ? json.label : null;
	},
	// take the given label from searchfield and check if the vocabulary has an item that matches to this label
	getItemFromVocabulary : function() {
			
		var that = this;
			
		var label = encodeURIComponent(that.getComponent().getValue());
		
		// build URL to CouchDB view (callback=dummy is not necessary)
		var urlString = getCouchURL() + getCouchDBDatabasename() + '/' + that.config.config.proxy.url;
		urlString += "?vocabularyId=" + that.config.config.vocabularyDoc + "&name="+label + "&callback=dummy";
		
		// apply the request
		var response = Ext.Ajax.request({
		    url: urlString,
		    async : false,		// <-- necessary!! Request must be syncronous!!
		    success: function(response){
				// nothing must be done here!
		    },
		    failure:function(response, opts){
				console.log("[AutocompleteField]: could not load json document" + response.responseText);
			}

		});
		
		// handle ajax response
    	var jsonresponse = response.responseText;
    	
		// remove "dummy(" from the beginning and ")" from end of json response
    	jsonresponse = jsonresponse.substring(jsonresponse.indexOf("(")+1, jsonresponse.length-1);

        var json = JSON.parse(jsonresponse);
        
        // walk through items in array. if labels match -> return the item
        for(item in json.data) {
			if(json.data[item].label.toLowerCase() == label.toLowerCase()) {
				return json.data[item];
			}
		}

		return null;
	},
	initialize: function() {
		
		var that = this;
		
		// eventhandler that hides the autocomplete list if finger taps into searchfield
	    // that.element.on('tap', function() { that.panel.hide(); }, that);

		// a few checks ...
		if (!that.config.config.proxy || !that.config.config.proxy.url || !that.config.config.vocabularyDoc) throw new Error('Proxy and vocabularyDoc must be set in autocomplete config.');
		if (!that.config.config.listHeight) that.config.config.listHeight = 350;
		if (!that.config.config.listWidth) that.config.config.listWidth = 250;
		
		// create sencha touch model
		if (!Ext.ModelManager.getModel('AutocompleteResult')) {
			Ext.define('AutocompleteResult', {
				extend: 'Ext.data.Model',
				config: {
					fields: ['uri', 'label', 'scientificName', 'vernacularName'] //,that.config.config.labelKey]
				}
			});
		}
		
		// create sencha touch store
		this.resultsStore = Ext.create('Ext.data.Store', {
			model: 'AutocompleteResult',
			defaultRootProperty: 'data',
			config: {
				autoLoad: false
			}
		});

		// get proxy from configuration
		this.resultsStore.setProxy(that.config.config.proxy);
		
		// create the list element
		this.resultsList = Ext.create('Ext.List', {
			itemId : "resultlist",
			store: that.resultsStore,
			margin: 0,
			itemTpl: '<div><span style="width:100%;white-space:normal;">{label}</span><br/><span style="size:10px; font-size:10px; color:#999999;">{uri}</span></div>',
			hideOnMaskTap : true,
			modal : true,
			top: 0,
			left: 0,
			height : that.config.config.listHeight,
			width:that.config.config.listWidth
			
		});
		
		this.closeButton = Ext.create('Ext.Button', {
		    text: 'Cancel',
		    handler: function() {
		        // this will signal that we don't have an uri
		        that.fireEvent('change', {});
		        that.panel.hide();
		    }
		});
	
		// create a html-panel and attach resultlist
		that.panel = Ext.create('Ext.Panel', {
					html: '<br/><br/><br/><div style="font-size:15px; color:#555555; text-align:center; width:100%;">No results found!</div>',
				    left: 0,
				    padding: 0,
					height : that.config.config.listHeight + 10,
					width:that.config.config.listWidth + 10,
				    items : [
				    	that.resultsList,
				    	{
				    	    xtype: 'toolbar',
				    	    docked: 'bottom',
				    	    items: [
				    	            {xtype: 'spacer'},
				    	            that.closeButton,
				    	            {xtype: 'spacer'}
			    	           ]
				    	}
				    ]
				 });

		// define function "searchForLabel" which is called when user hits the "Go" button on the keyboard
		var searchForLabel = function() {
			
			// do nothing if searchfield is empty
			if (that.getComponent().getValue() == '') return;
			
			// build URL string to CouchDB view
			var label = encodeURIComponent(that.getComponent().getValue());
			var uriString = getCouchURL() + getCouchDBDatabasename() + '/' + that.config.config.proxy.url;
			uriString += "?vocabularyId=" + that.config.config.vocabularyDoc + "&name="+label;
            console.log("uri_string1: " + uriString);
			that.resultsStore.getProxy().setUrl(uriString);
			
			// load the store. on success -> check if store is empty. if empty, hide the list and display html text.
			that.resultsStore.load(
				function(records, operation, success) {
				    console.log("resultStore: success = " + success + "; records: " + records.length);
					if(records.length == 0 || success == false) {
					    Ext.Msg.alert('', "There were no results found in the taxonomy, which are matching your input string.");
					    // this will signal that we don't have an uri
		                that.fireEvent('change', {});
					    that.panel.hide();
					}
					else {
                        that.panel.showBy(that.getComponent());
					}
				}
			
			);
			
		};
		
		// eventhandler if user taps on a list element
		this.resultsList.on('itemtap', function(self, index, target, record) {
			that.getComponent().setValue(record.get('label'));
			
			// 2013-03-01_Maria Egly: hack to get the two species name fields synchronized:
			// fires 'change' event with uri, common name, and scientific name in parameter args
			var args = {'uri': record.get('uri')};
			args.scientificName = record.get('scientificName');
            args.vernacularName = record.get('vernacularName');  
            that.fireEvent('change', args);
            /*
			var uriString = getCouchURL() + getCouchDBDatabasename() + '/_design/vocabulary/_list/searchByUri/vocabularies';
            uriString += "?vocabularyId=" + that.config.config.vocabularyDoc + "&name="+record.get('uri');
			that.resultsStore.getProxy().setUrl(uriString);
			console.log("uri_string: " + uriString);
	        that.resultsStore.load(
	                 function(records, operation, success) {
	                     console.log("resultStore: success = " + success + "; records: " + records.length);
	                     if (records.length > 0 ) {
                             console.log("record found1: " + JSON.stringify(records[0].getData()));
                             args.scientificName = records[0].getData().scientificName;
                             args.vernacularName = records[0].getData().vernacularName;                            
                             that.fireEvent('change', args);
	                     }
	                 }
              );
              */	         
			that.panel.hide();
		});
		
		// eventhandler if user pushes the "Go" button on the keyboard
		this.getComponent().on('keyup', function(e) {
			if (e.event.keyCode == 13) {
				searchForLabel();
			}
			
		});
	}
	
});



