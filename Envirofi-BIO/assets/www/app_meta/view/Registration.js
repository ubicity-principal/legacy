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
  * @file app/view/Registration.js
  * @authors Markus Cizek
  * @copyright Austrian Institute of Technology, 2013
  * @short This file shows the registration mask
  * 	   This functionality is currently not used in the app since we switched from login via 
  *        FI-Ware Identity Management to login via phone accounts.
  */
Ext.define('treeapp.view.Registration', {
	extend: 'Ext.form.Panel',
	xtype: 'registrationpanel',

	config: {
		styleHtmlContent: true,
		scrollable: false,
		id: 'registration-form',
		items: [
		
		{
			xtype: 'fieldset',
			id: 'registration-fieldset',
//			centered: true,
			styleHtmlContent: true,
			padding: 10,
			items: [
				{
					xtype: 'container',
					html: '<h1>ENVIROFI-BIO</h1><h5 style="padding-right: 3px; text-align: right; margin-bottom: -40px;">@mdafapp.client.version@</h5><h5>Registration</h5>',
					style: 'text-align: center',
					padding: 12
				},
				{
					xtype: 'container',
					html: '',
					id: 'registrationSuccessTxt',
					style: 'text-align: center',
					padding: 12,
					hidden: true
				},
				{
					xtype: 'textfield',
					id: 'registrationemail_id',
					name: 'registrationemail',
					label: '@treeapp.view.Registration.registrationemail@',
					hidden: false
				},
                {
                    xtype: 'passwordfield',
                    id: 'registrationpwd_id',
                    name: 'registrationpwd',
                    label: '@treeapp.view.Registration.registrationpwd@',
                    hidden: false
                },
                {
                    xtype: 'passwordfield',
                    id: 'registrationpwd_id_confirm',
                    name: 'registrationpwd_confirm',
                    label: '@treeapp.view.Registration.registrationpwd_confirm@',
                    hidden: false
                },
                {
                    xtype: 'button',
    				itemId: 'registration_btn',
    				id: 'registration_btn',
    				text: '@treeapp.view.Registration.registration@',
    				ui: 'round'
                }
			]
		}
	]
    }
});
