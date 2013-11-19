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
  * @file app/view/Login.js
  * @authors Markus Cizek
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha Touch view for the login mask
  * 	   This functionality is currently not used in the app since we switched from login via 
  *        FI-Ware Identity Management to login via phone accounts.
  */
Ext.define('treeapp.view.Login', {
	extend: 'Ext.form.Panel',
	xtype: 'loginpanel',
	
	config: {
		styleHtmlContent: true,
		scrollable: false,
		fullscreen: true,
		layout: 'fit',
        padding: 0,
		id: 'login-form',
		items: [
		{
			xtype: 'fieldset',
			id: 'login-fieldset',
//			centered: true,
			styleHtmlContent: true,
			padding: 0,
//			fullscreeen: true,
//			flex: 1,
	        layout: {
	            type: 'vbox',
	            align: 'stretch',
	            pack: 'center'
	        },
			items: [
				{
					xtype: 'container',
					html: '<h1>ENVIROFI-BIO</h1><h5 style="padding-right: 3px; text-align: right; margin-bottom: -40px;">0.5.8</h5><img src="img/envirofi.png" width="220" height="220">',
					style: 'text-align: center',
					padding: 12
				},
				{
					xtype: 'fieldset',
					docked: 'bottom',
					items: [
							{
								xtype: 'selectfield',
								id: 'loginaccounttype_id',
								name: 'loginaccounttype',
								label: '<div style="width:100%;white-space:normal;">Account Type:</div>',
								//usePicker: false,
								options : [],
					            height: 50,
					            listeners: {
				                    change: function () {				                    	
				                    	setAccountNames(this.getValue());
				                    }
					            }
							},
							{
								xtype: 'selectfield',
								id: 'loginemailselect_id',
								name: 'loginemailselect',
								label: '<div style="width:100%;white-space:normal;">Login Account:</div>',
								//usePicker: false,
								options : [],
					            height: 50
							},
		                {
		                    xtype: 'button',
		    				itemId: 'login_btn',
		    				id: 'login_btn',
		    				text: 'Login',
		    				style : {
								'margin' : '20px',
					    	},
		                    height: 30
		                }
					]
				}
			]
		}
	]
    }
});
