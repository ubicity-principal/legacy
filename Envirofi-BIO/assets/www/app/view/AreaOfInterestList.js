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
  * @file app/view/AreaOfInterestList.js
  * @authors Hermann Huber, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha touch view object for display of the list of areas of interest.
  *        
  */

Ext.define('treeapp.view.AreaOfInterestList', {
	                     
    extend: 'Ext.List',
    xtype: 'areaofinterestlist',
    requires: ['treeapp.store.areaofintereststore'],
    
    config: {
        title: 'Select an area',
        itemTpl: new Ext.XTemplate(
        		'<tpl if="activeEvents == \'true\'">',
        			'<div>','<span style="color:red;">{name} ({OoI_count})</span>','</div>',
            	'<tpl else>',
    				'<div>','<span>{name} ({OoI_count})</span>','</div>',
            	'</tpl>'
		),
        id: 'aoilist',
        store: 'areaofintereststore',
		//iconCls: 'home',
        onItemDisclosure: true,
        disableSelection: true        
    }
});

