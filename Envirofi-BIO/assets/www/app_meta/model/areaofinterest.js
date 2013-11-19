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
  * @file app/model/areaofinterest.js
  * @authors Clemens Bernhard Geyer, Maria Egly, Hermann Huber
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the data model of an Area of Interest.
  */

Ext.define('treeapp.model.areaofinterest', {
	
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {name: '_id', type: 'string'},
            {name: 'dbname', type: 'string'},
            {name: 'active', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'timestamp', type: 'string'},
			{name: 'createdBy', type: 'string'},
			{name: 'activeEvents', type: 'string'},
			{name: 'OoI_count', type: 'string'}
        ]		
    },
    
    getAoiName : function() {
    	var d = this.data;
    	return d.name;
    }
});