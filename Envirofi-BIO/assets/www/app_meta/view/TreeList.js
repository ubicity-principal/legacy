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
  * @file app/view/TreeList.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha Touch List view for trees.
  */

Ext.define('treeapp.view.TreeList', {
    extend: 'Ext.List',
    xtype: 'treelist',
    requires: ['treeapp.store.commontreestore'],
    
    config: {
        title: '@treeapp.view.TreeList.Title@',
        store: 'commontreestore',
		//iconCls: 'home',
        onItemDisclosure: true,
        //itemTpl: '<b>{treenumber}</b>: {commonname}',
        itemTpl : new Ext.XTemplate(
        			'<tpl if="this.isValid(commonname) ">',
                    	'<b>{treenumber}</b>: {commonname}',
                	'</tpl>',
                	'<tpl if="this.isNotValid(commonname) ">',
                    	'<b>{treenumber}</b>',
                	'</tpl>',
        			
        			{
        				isValid: function(name){
                     		return ((name !== null) && (name !== undefined) && (name !== "") && (name !== 'undefined') && (name != "N/A"));
                    	},
                    	isNotValid: function(name){
                     		return !((name !== null) && (name !== undefined) && (name !== "") && (name !== 'undefined') && (name != "N/A"));
                    	}
        			}
        	),
        id: 'treelist'
    }
});
