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
  * @file app/view/NewTree.js
  * @authors Clemens Bernhard Geyer
  * @copyright Austrian Institute of Technology, 2013
  * @short This file defines the form for reporting new trees to the server.
  */
Ext.define('treeapp.view.NewTree', {
    extend: 'Ext.form.Panel',
    xtype: 'vtlnewtree',

    config: {
       // title: 'Upload Tree Observation',
        scrollable: true,
        id: 'vtlnewtree-form',
        items: [
            {
                xtype: 'panel',             
                id: 'selectPanel',
                margin: '0 0 8 0',
                items: [
                    {
                        xtype: 'selectfield',
                        name: 'selectproperty',
                        id: 'selectproperty',
                        label: 'Properties:',
                        labelWrap: true,
                        usePicker: false,
                        options: [
/*                                  {text: '', value: 'empty'}
                                  {text: 'Inventory', value: 'inventoryId'},
                                  {text: 'Identification', value: 'speciesId'},
                                  {text: 'Location', value: 'locationId'},
                                  {text: 'Length Properties', value: 'lengthpropertiesId'},
                                  {text: 'Planting Year', value: 'yearId'},
                                  {text: 'Comment', value: 'commentId'},
                                  {text: 'Image', value: 'imageId'}
*/                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                items: [
                    {
                        xtype: 'fieldset',
                        title: 'Inventory',
                        name: 'inventory',
                        id : 'inventoryId',
                        margin: 0,
                        hidden: false,
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'treeid',
                                readOnly: true,
                                hidden: true
                            },
                            {
                                xtype: 'textfield',
                                name: 'user',
                                readOnly: true,
                                hidden: true
                            },
                            {
                                xtype: 'textfield',
                                name: 'treenumber',
                                id : 'treenumberId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Tree Number</div>',
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        name: 'species',
                        id : 'speciesId',
                        title: 'Identification',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'taxonomy_uri',
                                id: 'taxonomy_uri',
                                value: '',
                                hidden: true
                            },
                            {
                                xtype: 'autocompletefield',
                                label: '<div style="width:100%;white-space:normal;">Species Name</div>',
                                name: 'name',
                                id : 'speciesNameId',
                                value: '',
                                config: {
                                    proxy: {
                                        type: 'jsonp',
                                        url :  "_design/vocabulary/_list/searchByScientificName/vocabularies",
                                        reader: {
                                            type: 'json',
                                            rootProperty: 'data'
                                        }
                                    },
                                    vocabularyDoc : "vocabulary.trees.de",
                                    listHeight : 300,
                                    listWidth : 200
                                    
                                },
                                listeners: {                                   
                                    change: function (args) {   
                                        console.log("args = " + JSON.stringify(args));
                                        Ext.getCmp('taxonomy_uri').setValue('');
                                        Ext.getCmp('commonNameId').getComponent().setValue('');
                                        if (args.uri != undefined && args.vernacularName != undefined) {
                                            Ext.getCmp('taxonomy_uri').setValue(args.uri); 
                                            Ext.getCmp('commonNameId').getComponent().setValue(args.vernacularName);
                                        }
                                        console.log("ChangeScientific");
                                    }
                                }                 
                            },
                            {
                                xtype: 'autocompletefield',
                                label: '<div style="width:100%;white-space:normal;">Common Name</div>',
                                name: 'commonname',
                                id : 'commonNameId',
                     			value: '',
                                config: {
                                    proxy: {
                                        type: 'jsonp',
                                        url :  "_design/vocabulary/_list/searchByVernacularName/vocabularies",
                                        reader: {
                                             type: 'json',
                                             rootProperty: 'data'
                                        }
                                    },
                                    vocabularyDoc : "vocabulary.trees.de",
                                    listHeight : 300,
                                    listWidth : 200
                                    
                                },
                                listeners: {                                    
                                    change: function (args) {   
                                        console.log("args = " + JSON.stringify(args));
                                        Ext.getCmp('taxonomy_uri').setValue('');
                                        Ext.getCmp('speciesNameId').getComponent().setValue('');
                                        if (args.uri != undefined && args.scientificName != undefined) {
                                            Ext.getCmp('taxonomy_uri').setValue(args.uri); 
                                            Ext.getCmp('speciesNameId').getComponent().setValue(args.scientificName);
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        name: 'location',
                        id : 'locationId',
                        title: 'Location',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'fieldset',
                                name: 'wgs84',
                                id : 'wgs84Id',
                                title: 'WGS84 Coordinates',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'location_lat',
                                        id: 'location_latId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">Latitude</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'location_lon',
                                        id: 'location_lonId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">Longitude</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'location_alt',
                                        id: 'location_altId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">Altitude</div>',
                                    },
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'relative_pos',
                                id : 'relative_posId',
                                title: 'Relative Position',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'azimut',
                                        id: 'location_azimut',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Azimut [°]</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'distance',
                                        id: 'location_distance',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Distance [m]</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'referencepoint',
                                        id: 'location_referencepoint',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Reference Point</div>',
                                    },
                                ]
                            },
/*                            {
                                xtype: 'fieldset',
                                name: 'gk_pos',
                                id : 'gk_posId',
                                title: 'Gauß-Krüger Coordinates',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'gk_easting',
                                        id: 'location_gkEastId',
                                        labelWrap: true,
//                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">GK Easting</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'gk_northing',
                                        id: 'location_gNorthId',
                                        labelWrap: true,
//                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">GK Northing</div>',
                                    }
                                ]
                            },
*/                            {
                                xtype: 'fieldset',
                                name: 'address',
                                id : 'addressId',
                                title: 'Address',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'street',
                                        id: 'streetId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Street</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'area',
                                        id: 'areaId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Area</div>',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        name: 'lengthproperties',
                        id : 'lengthpropertiesId',
                        title: 'Length Properties',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'height',
                                id: 'heightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Height [m]</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'crowningheight',
                                id: 'crowningheightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Crowning Height [m]</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'deadwoodheight',
                                id: 'deadwoodheightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Deadwood Height [m]</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'diameter',
                                id: 'diameterId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Crown Diameter [m]</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'circumference',
                                id: 'circumferenceId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Trunk Circumference [cm]</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'bhd',
                                id: 'bhdId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">Diameter at Breast Height (DBH) [cm]</div>',
                            }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        name: 'year',
                        id: 'yearId',
                        labelWrap: true,
                        label: '<div style="width:100%;white-space:normal;">Planting Year</div>',
                        hidden: true
                    },
                    {
                        xtype: 'textareafield',
                        name: 'comment',
                        id: 'commentId',
                        labelWrap: true,
                        label: '<div style="width:100%;white-space:normal;">Comment</div>',
                        hidden: true
                    },
                    {
                        xtype: 'fieldset',
                        id: 'imageId',
                        title: 'Image',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'imagetype',
                                id: 'imagetypefield',
                                label: '<div style="width:100%;white-space:normal;">Image Type</div>',
                                options: [
                                    {text: 'Tree', value: 'TREE'},
                                    {text: 'Leaf', value: 'LEAF'},
                                    {text: 'Fruit', value: 'FRUIT'},
                                    {text: 'Tree Bark', value: 'BARK'},
                                    {text: 'Flower', value: 'FLOWER'},
                                    {text: 'Leaf Connection to Branch', value: 'LEAFCONN'},
                                    {text: 'Other', value: 'OTHER'},
                                ]
                            },
                            {
                                xtype: 'button',
                                //styleHtmlContent: true,
                                //text: 'Choose Image',
                                //style: 'font-size: 15pt',
                                html: '<img src="img/photo_black2.png" width="30" height="30"/>',
                                padding: 5,
                                ui: 'round',
                                id: 'imagechoosebutton'             
                            },
                            {
                                xtype: 'textareafield',
                                name: 'imagecomment',
                                id: 'imagecommentid',
                                label: '<div style="width:100%;white-space:normal;">Comment for image</div>',
                            },
                            {
                                xtype: 'panel',
                                id: 'vtlobservationimage',
                                //html: '<image width="50" src="img/rotate_left.png" onclick="rotateImage(-90);"/><canvas id="vtlobservationcanvas"></canvas><image width="50" src="img/rotate_right.png" onclick="rotateImage(90);"/>',
                                html: '<br/><image id="vtlobservationhtmlimg" src="img/blank.png">',
                                style: 'text-align: center; vertical',
                                padding: 5,
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        id: 'classificationId',
                        title: 'Classifications',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'socialposition',
                                id: 'socialpositionId',
                                label: '<div style="width:100%;white-space:normal;">Social Position (Kraft)</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: '1 Dominant', value: '1 Dominant'},
                                          {text: '2 Dominant, main stock', value: '2 Dominant, main stock'},
                                          {text: '3 Semi-Dominant', value: '3 Semi-Dominant'},
                                          {text: '4 Dominated', value: '4 Dominated'},
                                          {text: '5 Suppressed', value: '5 Suppressed'},
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        id: 'statusId',
                        title: 'Status',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'statusforestinventory',
                                id: 'statusforestinventoryId',
                                label: '<div style="width:100%;white-space:normal;">Tree Status Forest Inventory</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: 'living', value: 'living'},
                                          {text: 'dead lying', value: 'dead lying'},
                                          {text: 'dead standing', value: 'dead standing'}
                                ]
                            },
                            {
                                xtype: 'selectfield',
                                name: 'statussiteinventory',
                                id: 'statussiteinventoryId',
                                label: '<div style="width:100%;white-space:normal;">Tree Status Site Inventory</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: 'dying', value: 'dying'},
                                          {text: 'living', value: 'living'},
                                          {text: 'stock', value: 'stock'},
                                          {text: 'dead lying', value: 'dead lying'},
                                          {text: 'dead decayed', value: 'dead decayed'},
                                          {text: 'dead standing', value: 'dead standing'},
                                          {text: 'root plate', value: 'root plate'},
                                          {text: 'unknown', value: 'unknown'}
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'barkbeetle',
                                id: 'barkbeetleId',
                                title: 'Barkbeetle Infestation',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'barkbeetledate',
                                        id: 'barkbeetledateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Event Date</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'barkbeetleaccuracy',
                                        id: 'barkbeetleaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Accuracy Event Date [Years]</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'winddamage',
                                id: 'winddamageId',
                                title: 'Wind Damage',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'selectfield',
                                        name: 'winddamagecategory',
                                        id: 'winddamagecategoryId',
                                        label: '<div style="width:100%;white-space:normal;">Category</div>',
                                        options: [
                                                  {text: '', value: ''},
                                                 {text: 'Broken branches', value: 'Broken branches'},
                                                  {text: 'Breakage due to wind', value: 'Breakage due to wind'},
                                                  {text: 'Treetop breakage', value: 'Treetop breakage'},
                                                  {text: 'Wind throw', value: 'Wind throw'},
                                                  {text: 'no wind damage', value: 'no wind damage'}
                                        ]
                                    },
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'winddamagedate',
                                        id: 'winddamagedateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Event Date</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'winddamageaccuracy',
                                        id: 'winddamageaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Accuracy Event Date [Years]</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'lightchanges',
                                id: 'lightchangesId',
                                title: 'Light Changes',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'lightchangesdate',
                                        id: 'lightchangesdateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Event Date</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'lightchangesaccuracy',
                                        id: 'lightchangesaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">Accuracy Event Date [Years]</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'treedamagefield',
                                id: 'treedamagefieldId',
                                title: 'Tree damage (1-n)',
                                margin: 0,
                                items: [
                                        {
                                            xtype: 'selectfield',
                                            name: 'treedamage1',
                                            id: 'treedamage1Id',
                                            label: '<div style="width:100%;white-space:normal;">Dominant Damage</div>',
                                            options: [
                                                      {text: '', value: ''},
                                                      {text: '0 No Damage', value: '0 No Damage'},
                                                      {text: '1 Peeling', value: '1 Peeling'},
                                                      {text: '2 Harvest Damage', value: '2 Harvest Damage'},
                                                      {text: '3 Top Broken', value: '3 Top Broken'},
                                                      {text: '4 Other damage', value: '4 Other damage'}
                                            ]
                                        },
                                        {
                                            xtype: 'selectfield',
                                            name: 'treedamage2',
                                            id: 'treedamage2Id',
                                            label: '<div style="width:100%;white-space:normal;">Further Damage</div>',
                                            options: [
                                                      {text: '', value: ''},
                                                      {text: '0 No Damage', value: '0 No Damage'},
                                                      {text: '1 Peeling', value: '1 Peeling'},
                                                      {text: '2 Harvest Damage', value: '2 Harvest Damage'},
                                                      {text: '3 Top Broken', value: '3 Top Broken'},
                                                      {text: '4 Other damage', value: '4 Other damage'}
                                            ]
                                        }
                                ]
                            }
                        ]
                    }
                ]
            },
			{
                xtype: 'panel',             
                docked: 'bottom',
                id: 'saveNewObjectButton',
                layout: {
                    type: 'vbox',
                    align: 'middle'
                },
                style: 'background-color: black;',
                padding: 7,
                items: [
                    {
                        xtype: 'button',
                        id: 'submitnewobservationbutton',
                        text: 'Upload Tree',
                        ui: 'round',
                        hidden: true
                    },
                    {
                        xtype: 'button',
                        id: 'submitobservationbutton',
                        text: 'Save Observation',
                        ui: 'round',
                        hidden: true
                    }
                ]
            }
        ]
    }
});
