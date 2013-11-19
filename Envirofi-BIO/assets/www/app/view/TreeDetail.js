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
  * @file app/view/TreeDetail.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the parent container for the tree detail 
  *        container and tree comments.
  */
Ext.define('treeapp.view.TreeDetail', {
	extend: 'Ext.Container',
    xtype: 'treedetail',
	
	requires: ['treeapp.view.TreeDetailTable'],

    config: {
        //title: 'Tree Details',
		id: 'treedetail',
        styleHtmlContent: true,
        scrollable: true,
        margin: '0 0 0 0',
        padding: '0,0,0,0',
		fullscreen: true,
		items: [
			{
				xtype: 'container',
				id: 'treedetail-container',
//				margin: '0 0 0 0',
//			    padding: '0 0 0 0',
			},
			{
				xtype: 'toolbar',				
				docked: 'bottom',
				items: [
                   { xtype: 'spacer' },
                   {
					   itemId: 'addobservationbutton',
					   text: '<span>Add</span><br><span>Observation</span>'
					},
					{
						itemId: 'openExternalAppButton',
					    text: '<span>External</span><br><span>App</span>'
					},
					{
						itemId: 'createtag',
					    text: '<span>Create</span><br><span>NFC Tag</span>'
					},
					{ xtype: 'spacer' }
				]
			}
		]
    }
});
