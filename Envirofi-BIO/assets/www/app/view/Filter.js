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
  * @file app/view/Filter.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines a filter form to restrict the current number of trees
  *        saved in the local storage object.
  */

Ext.define('treeapp.view.Filter', {
	extend: 'Ext.form.Panel',
	xtype: 'vtlfilter',
	id: 'filterform',
	
	config: {
		title: 'Filter',
		styleHtmlContent: true,
		scrollable: true,
		items: [
			{
				xtype: 'selectfield',
				name: 'filtertype',
				id: 'filtertype',
				label: 'Filter Type',
				options: [
					{text: 'Numeric Filter', value: 'numeric'},
					{text: 'Textual Filter', value: 'textual'}
				]
			},
			{
				xtype: 'fieldset',
				id: 'numericfilter-fieldset',
				title: 'Numeric Filter',
				items: [
					{
						xtype: 'selectfield',
						name: 'numericfieldname',
						label: 'Field Name',
						options: [
							{text: 'Tree Number', value: 'treenumber'},
							{text: 'Trunk Circumference [cm]', value: 'circumference'},
							{text: 'Height [m]', value: 'height'},
							{text: 'Crown Diameter [m]', value: 'diameter'},
							{text: 'Planting Year', value: 'year'}
						]
					},
					{
						xtype: 'selectfield',
						name: 'numericcriterion',
						label: 'Criterion',
						options: [
							{text: '=', value: 'e'},
							{text: '<', value: 'l'},
							{text: '>', value: 'g'}
						]
					},
					{
						xtype: 'textfield',
						name: 'numberexpr',
						label: 'Value',
					}
				]
			},
			{
				xtype: 'fieldset',
				id: 'textualfilter-fieldset',
				title: 'Textual Filter',
				hidden: true,
				items: [
					{
						xtype: 'selectfield',
						name: 'textualfieldname',
						label: 'Field Name',
						options: [
							{text: 'Common Name', value: 'commonname'},
							{text: 'Species Name', value: 'name'},
							{text: 'Data Provider', value: 'provider'},
							{text: 'Area', value: 'area'},
							{text: 'Street', value: 'street'}
						]
					},
					{
						xtype: 'textfield',
						name: 'stringexpr',
						label: 'Expression'
					}
				]
			},
			{
				xtype: 'button',
				style: 'font-size: 12pt',
				text: 'Apply Filter',
				padding: 5,
				margin: 10,
				ui: 'round',
				id: 'applyfilterbutton'				
			},
			{
				xtype: 'button',
				style: 'font-size: 12pt',
				text: 'Remove Filter',
				padding: 5,
				margin: 10,
				ui: 'round',
				id: 'removefilterbutton'				
			},
		]
	}
});
