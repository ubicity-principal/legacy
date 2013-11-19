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
		title: '@treeapp.view.Filter.Title@',
		styleHtmlContent: true,
		scrollable: true,
		items: [
			{
				xtype: 'selectfield',
				name: 'filtertype',
				id: 'filtertype',
				label: '@treeapp.view.Filter.filterTypeLabel@',
				options: [
					{text: '@treeapp.view.Filter.filterTypeNumericLabel@', value: 'numeric'},
					{text: '@treeapp.view.Filter.filterTypeTextualLabel@', value: 'textual'}
				]
			},
			{
				xtype: 'fieldset',
				id: 'numericfilter-fieldset',
				title: '@treeapp.view.Filter.filterTypeNumericLabel@',
				items: [
					{
						xtype: 'selectfield',
						name: 'numericfieldname',
						label: '@treeapp.view.Filter.fieldName@',
						options: [
							{text: '@treeapp.view.TreeDetail.TreeNumberLabel@', value: 'treenumber'},
							{text: '@treeapp.view.TreeDetail.TrunkCircumferenceLabel@', value: 'circumference'},
							{text: '@treeapp.view.TreeDetail.HeightLabel@', value: 'height'},
							{text: '@treeapp.view.TreeDetail.CrownDiameterLabel@', value: 'diameter'},
							{text: '@treeapp.view.TreeDetail.PlantingYearLabel@', value: 'year'}
						]
					},
					{
						xtype: 'selectfield',
						name: 'numericcriterion',
						label: '@treeapp.view.Filter.criterion@',
						options: [
							{text: '=', value: 'e'},
							{text: '<', value: 'l'},
							{text: '>', value: 'g'}
						]
					},
					{
						xtype: 'textfield',
						name: 'numberexpr',
						label: '@treeapp.view.Filter.Value@',
					}
				]
			},
			{
				xtype: 'fieldset',
				id: 'textualfilter-fieldset',
				title: '@treeapp.view.Filter.filterTypeTextualLabel@',
				hidden: true,
				items: [
					{
						xtype: 'selectfield',
						name: 'textualfieldname',
						label: '@treeapp.view.Filter.fieldName@',
						options: [
							{text: '@treeapp.view.TreeDetail.CommonNameLabel@', value: 'commonname'},
							{text: '@treeapp.view.TreeDetail.SpeciesNameLabel@', value: 'name'},
							{text: '@treeapp.view.TreeDetail.DataProviderLabel@', value: 'provider'},
							{text: '@treeapp.view.TreeDetail.AreaLabel@', value: 'area'},
							{text: '@treeapp.view.TreeDetail.StreetLabel@', value: 'street'}
						]
					},
					{
						xtype: 'textfield',
						name: 'stringexpr',
						label: '@treeapp.view.Filter.expression@'
					}
				]
			},
			{
				xtype: 'button',
				style: 'font-size: 12pt',
				text: '@treeapp.view.Filter.applyFilterButtonLabel@',
				padding: 5,
				margin: 10,
				ui: 'round',
				id: 'applyfilterbutton'				
			},
			{
				xtype: 'button',
				style: 'font-size: 12pt',
				text: '@treeapp.view.Filter.removeFilterButtonLabel@',
				padding: 5,
				margin: 10,
				ui: 'round',
				id: 'removefilterbutton'				
			},
		]
	}
});
