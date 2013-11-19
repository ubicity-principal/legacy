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
  * @file app/store/areaofintereststore.js
  * @authors Clemens Bernhard Geyer, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the sencha touch store object for retrieval of 
  *        tree documents from the database
  */

Ext.define('treeapp.store.commontreestore', {
	extend: 'Ext.data.Store',
	
	config: {
		model: 'treeapp.model.commontree',
		defaultRootProperty: 'data',
		groupParam: undefined,
		   pageParam: undefined,
		   startParam: undefined,
		   sortParam: undefined,
		   limitParam: undefined,
		   pageSize : 10000,
		proxy: {
			type: 'jsonp',
			groupParam: undefined,
		   pageParam: undefined,
		   startParam: undefined,
		   sortParam: undefined,
		   limitParam: undefined,
			// only define base url here, bbox will be added by controller
 //            url: 'http://envirofi.ait.ac.at/GeoCouch/treecommon/_design/main/_spatial/_list/treedata/trees',
			//url: 'http://172.30.33.243/couchdb/viennatree/_design/main/_spatial/_list/treedata/trees',
			reader: {
				type: 'json',
				rootProperty: 'data'
			}
		}/*,
		autoLoad: true */
	}
});