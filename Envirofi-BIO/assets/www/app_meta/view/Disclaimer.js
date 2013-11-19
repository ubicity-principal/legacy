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
  * @file app/view/Disclaimer.js
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha Touch view object for the disclaimer when the app is started
  */
Ext.define('treeapp.view.Disclaimer', {
    extend: 'Ext.form.Panel',
    xtype: 'disclaimerpanel',

    config: {
        styleHtmlContent: true,
        scrollable: false,
        id: 'disclaimer',
        fullscreen: true,
        layout: 'vbox',
        items: [
           {
               xtype: 'fieldset',
               id: 'disclaimer-fieldset',
               styleHtmlContent: true,
               flex: 1,
               items: [
                   {
                       xtype: 'textareafield',
                       html: '@mdaf.disclaimer@',
                       style: 'text-align: center',
                       padding: 12
                   }
               ]
           },
           {
               xtype: 'toolbar',
               docked: 'bottom',
               items: [
                   { xtype: 'spacer' },
                   {
                       text: 'Ok',
                       handler: function() {
                           showLogin();
                       }
                   },
                   {
                       text: '@treeapp.dialog.dontShowAgain@',
                       handler: function() {
                           localStorage.setItem("showDisclaimer", '0');
                           showLogin();
                       }
                   },
                   { xtype: 'spacer' }
               ]
           }
        ]
    }
});
