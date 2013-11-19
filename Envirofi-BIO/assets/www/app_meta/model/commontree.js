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
  * @file app/model/commontree.js
  * @authors Clemens Bernhard Geyer, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the current data model of an object in the 
  *        tree database.
  */
Ext.define('treeapp.model.commontree', {
	
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {name: '_id', type: 'string'},
            {name: 'treeid', type: 'string'},
			{name: 'lon', type: 'float'},
            {name: 'lat', type: 'float'},
            {name: 'alt', type: 'float'},
			{name: 'treenumber', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'commonname', type: 'string'},
            {name: 'probability', type: 'string'},
            {name: 'observationId', type: 'string'},
			{name: 'area', type: 'string'},
            {name: 'street', type: 'string'},
			{name: 'provider', type: 'string'},
			{name: 'height', type: 'float'},
			{name: 'diameter', type: 'float'},
            {name: 'circumference', type: 'float'},
            {name: 'bhd', type: 'float'},
            {name: 'year', type: 'int'},
            {name: 'time', type: 'string'},
            {name: 'comment', type: 'string'},
            {name: 'imagecomment', type: 'string'},
            {name: 'image', type: 'string'},
            {name: 'imageFile', type: 'string'},
            {name: 'imageDocId', type: 'string'},
            {name: 'imageorientation', type: 'integer'},
            {name: 'imagetype', type: 'string'},

            {name: 'azimut', type: 'float'},
            {name: 'distance', type: 'float'},
            {name: 'referencepoint', type: 'string'},
//            {name: 'gk_easting', type: 'float'},
//            {name: 'gk_northing', type: 'float'},
            {name: 'crowningheight', type: 'float'},
            {name: 'deadwoodheight', type: 'float'},
            {name: 'socialposition', type: 'string'},
            {name: 'statusforestinventory', type: 'string'},
            {name: 'statussiteinventory', type: 'string'},
            {name: 'barkbeetledate', type: 'string'},
            {name: 'barkbeetleaccuracy', type: 'integer'},
            {name: 'winddamagecategory', type: 'string'},
            {name: 'winddamagedate', type: 'string'},
            {name: 'winddamageaccuracy', type: 'integer'},
            {name: 'lightchangesdate', type: 'string'},
            {name: 'lightchangesaccuracy', type: 'integer'}
        ]		
    }
});