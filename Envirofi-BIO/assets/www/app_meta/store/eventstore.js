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
  * @file app/store/eventstore.js
  * @authors Hermann Huber, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the sencha touch store object for 
  *        display of event notifications on the area of interest screen
  *        of the application.
  *        
  */

Ext.define('treeapp.store.eventstore', {
	extend: 'Ext.data.Store',
	
	config: {
		//model: 'treeapp.model.areaofinterest',
		defaultRootProperty: 'data',
		autoLoad: false,
		fields : [
			{name : "_id", type : "string"},
			{name : "heading", type : "string"},
			{name : "provider", type : "string"},
			{name : "text", type : "string"},
			{name : "iconurl", type : "string"},
			{name : "visited", type : "string"},
			{name : "created", type : "string"},
			{name : "expired", type : "string"},		
			{name : "distance", type : "float"}			
		],
		sorters: [
		          {
		              property : 'created',
		              direction: 'DESC'
		          }
		      ],
		proxy: {
            type: 'jsonp',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
	}
});

