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
       // title: '@treeapp.view.TreeObservation.Title@',
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
                        label: '@treeapp.view.TreeDetail.PropertyLabel@',
                        labelWrap: true,
                        usePicker: false,
                        options: [
/*                                  {text: '', value: 'empty'}
                                  {text: '@treeapp.view.TreeDetail.InventoryLabel@', value: 'inventoryId'},
                                  {text: '@treeapp.view.TreeDetail.SpeciesLabel@', value: 'speciesId'},
                                  {text: '@treeapp.view.TreeDetail.LocationLabel@', value: 'locationId'},
                                  {text: '@treeapp.view.TreeDetail.LengthPropertiesLabel@', value: 'lengthpropertiesId'},
                                  {text: '@treeapp.view.TreeDetail.PlantingYearLabel@', value: 'yearId'},
                                  {text: '@treeapp.view.TreeDetail.CommentLabel@', value: 'commentId'},
                                  {text: '@treeapp.view.TreeDetail.ImageLabel@', value: 'imageId'}
*/                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                items: [
                    {
                        xtype: 'fieldset',
                        title: '@treeapp.view.TreeDetail.InventoryLabel@',
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
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.TreeNumberLabel@</div>',
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        name: 'species',
                        id : 'speciesId',
                        title: '@treeapp.view.TreeDetail.SpeciesLabel@',
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
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.SpeciesNameLabel@</div>',
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
                                    vocabularyDoc : "@treeapp.view.TreeDetail.vocabulary@",
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
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.CommonNameLabel@</div>',
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
                                    vocabularyDoc : "@treeapp.view.TreeDetail.vocabulary@",
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
                        title: '@treeapp.view.TreeDetail.LocationLabel@',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'fieldset',
                                name: 'wgs84',
                                id : 'wgs84Id',
                                title: '@treeapp.view.TreeDetail.Wgs84@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'location_lat',
                                        id: 'location_latId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.GPSLabelLat@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'location_lon',
                                        id: 'location_lonId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.GPSLabelLong@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'location_alt',
                                        id: 'location_altId',
                                        labelWrap: true,
                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.GPSLabelAlt@</div>',
                                    },
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'relative_pos',
                                id : 'relative_posId',
                                title: '@treeapp.view.TreeDetail.RelativePosition@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'azimut',
                                        id: 'location_azimut',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.Azimut@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'distance',
                                        id: 'location_distance',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.Distance@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'referencepoint',
                                        id: 'location_referencepoint',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.Refpoint@</div>',
                                    },
                                ]
                            },
/*                            {
                                xtype: 'fieldset',
                                name: 'gk_pos',
                                id : 'gk_posId',
                                title: '@treeapp.view.TreeDetail.GK_MN31@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'gk_easting',
                                        id: 'location_gkEastId',
                                        labelWrap: true,
//                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.GKLabelEast@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'gk_northing',
                                        id: 'location_gNorthId',
                                        labelWrap: true,
//                                        readOnly: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.GKLabelNorth@</div>',
                                    }
                                ]
                            },
*/                            {
                                xtype: 'fieldset',
                                name: 'address',
                                id : 'addressId',
                                title: '@treeapp.view.TreeDetail.Address@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'street',
                                        id: 'streetId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.StreetLabel@</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'area',
                                        id: 'areaId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.AreaLabel@</div>',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        name: 'lengthproperties',
                        id : 'lengthpropertiesId',
                        title: '@treeapp.view.TreeDetail.LengthPropertiesLabel@',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'height',
                                id: 'heightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.HeightLabel@</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'crowningheight',
                                id: 'crowningheightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.CrowningHeightLabel@</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'deadwoodheight',
                                id: 'deadwoodheightId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.DeadwoodHeightLabel@</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'diameter',
                                id: 'diameterId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.CrownDiameterLabel@</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'circumference',
                                id: 'circumferenceId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.TrunkCircumferenceLabel@</div>',
                            },
                            {
                                xtype: 'textfield',
                                name: 'bhd',
                                id: 'bhdId',
                                labelWrap: true,
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.TrunkDiameterLabel@</div>',
                            }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        name: 'year',
                        id: 'yearId',
                        labelWrap: true,
                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.PlantingYearLabel@</div>',
                        hidden: true
                    },
                    {
                        xtype: 'textareafield',
                        name: 'comment',
                        id: 'commentId',
                        labelWrap: true,
                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.CommentLabel@</div>',
                        hidden: true
                    },
                    {
                        xtype: 'fieldset',
                        id: 'imageId',
                        title: '@treeapp.view.TreeDetail.ImageLabel@',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'imagetype',
                                id: 'imagetypefield',
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeObservation.ImageTypeLabel@</div>',
                                options: [
                                    {text: '@treeapp.view.TreeObservation.ImageTypeTree@', value: 'TREE'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeLeaf@', value: 'LEAF'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeFruit@', value: 'FRUIT'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeBark@', value: 'BARK'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeFlower@', value: 'FLOWER'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeLeafConnection@', value: 'LEAFCONN'},
                                    {text: '@treeapp.view.TreeObservation.ImageTypeOther@', value: 'OTHER'},
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
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeObservation.ImageCommentLabel@</div>',
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
                        title: '@treeapp.view.TreeDetail.ClassificationPropertiesLabel@',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'socialposition',
                                id: 'socialpositionId',
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.SocialPositionLabel@</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: '@treeapp.view.TreeDetail.SocialPosition.Dominant@', value: '1 Dominant'},
                                          {text: '@treeapp.view.TreeDetail.SocialPosition.DominantMain@', value: '2 Dominant, main stock'},
                                          {text: '@treeapp.view.TreeDetail.SocialPosition.SemiDominant@', value: '3 Semi-Dominant'},
                                          {text: '@treeapp.view.TreeDetail.SocialPosition.Dominated@', value: '4 Dominated'},
                                          {text: '@treeapp.view.TreeDetail.SocialPosition.Suppressed@', value: '5 Suppressed'},
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        id: 'statusId',
                        title: '@treeapp.view.TreeDetail.StatusPropertiesLabel@',
                        hidden: true,
                        margin: 0,
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'statusforestinventory',
                                id: 'statusforestinventoryId',
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.ForestInventoryLabel@</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: '@treeapp.view.TreeDetail.ForestInventory.Living@', value: 'living'},
                                          {text: '@treeapp.view.TreeDetail.ForestInventory.DeadLying@', value: 'dead lying'},
                                          {text: '@treeapp.view.TreeDetail.ForestInventory.DeadStanding@', value: 'dead standing'}
                                ]
                            },
                            {
                                xtype: 'selectfield',
                                name: 'statussiteinventory',
                                id: 'statussiteinventoryId',
                                label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.SiteInventoryLabel@</div>',
                                options: [
                                          {text: '', value: ''},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.Dying@', value: 'dying'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.Living@', value: 'living'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.Stock@', value: 'stock'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.DeadLying@', value: 'dead lying'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.DeadDecayed@', value: 'dead decayed'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.DeadStanding@', value: 'dead standing'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.RootPlate@', value: 'root plate'},
                                          {text: '@treeapp.view.TreeDetail.SiteInventory.Unknown@', value: 'unknown'}
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'barkbeetle',
                                id: 'barkbeetleId',
                                title: '@treeapp.view.TreeDetail.BarkbeetleLabel@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'barkbeetledate',
                                        id: 'barkbeetledateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.Barkbeetle.EventDate@</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'barkbeetleaccuracy',
                                        id: 'barkbeetleaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.Barkbeetle.AccuracyEventDate@</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'winddamage',
                                id: 'winddamageId',
                                title: '@treeapp.view.TreeDetail.WindDamageLabel@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'selectfield',
                                        name: 'winddamagecategory',
                                        id: 'winddamagecategoryId',
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.WindDamage.Category@</div>',
                                        options: [
                                                  {text: '', value: ''},
                                                 {text: '@treeapp.view.TreeDetail.WindDamage.Category.BrokenBranches@', value: 'Broken branches'},
                                                  {text: '@treeapp.view.TreeDetail.WindDamage.Category.BreakageDueToWind@', value: 'Breakage due to wind'},
                                                  {text: '@treeapp.view.TreeDetail.WindDamage.Category.TreetopBreakage@', value: 'Treetop breakage'},
                                                  {text: '@treeapp.view.TreeDetail.WindDamage.Category.WindThrow@', value: 'Wind throw'},
                                                  {text: '@treeapp.view.TreeDetail.WindDamage.Category.NoWindDamage@', value: 'no wind damage'}
                                        ]
                                    },
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'winddamagedate',
                                        id: 'winddamagedateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.WindDamage.EventDate@</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'winddamageaccuracy',
                                        id: 'winddamageaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.WindDamage.AccuracyEventDate@</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'lightchanges',
                                id: 'lightchangesId',
                                title: '@treeapp.view.TreeDetail.LightChangesLabel@',
                                margin: 0,
                                items: [
                                    {
                                        xtype: 'datepickerfield',
                                        name: 'lightchangesdate',
                                        id: 'lightchangesdateId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.LightChanges.EventDate@</div>',
                                        // value: new Date()
                                    },
                                    {
                                        xtype: 'textfield',
                                        name: 'lightchangesaccuracy',
                                        id: 'lightchangesaccuracyId',
                                        labelWrap: true,
                                        label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.LightChanges.AccuracyEventDate@</div>'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                name: 'treedamagefield',
                                id: 'treedamagefieldId',
                                title: '@treeapp.view.TreeDetail.TreeDamage@',
                                margin: 0,
                                items: [
                                        {
                                            xtype: 'selectfield',
                                            name: 'treedamage1',
                                            id: 'treedamage1Id',
                                            label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.TreeDamage1@</div>',
                                            options: [
                                                      {text: '', value: ''},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.NoDamage@', value: '0 No Damage'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.Peeling@', value: '1 Peeling'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.HarvestDamage@', value: '2 Harvest Damage'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.TopBroken@', value: '3 Top Broken'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.OtherDamage@', value: '4 Other damage'}
                                            ]
                                        },
                                        {
                                            xtype: 'selectfield',
                                            name: 'treedamage2',
                                            id: 'treedamage2Id',
                                            label: '<div style="width:100%;white-space:normal;">@treeapp.view.TreeDetail.TreeDamage2@</div>',
                                            options: [
                                                      {text: '', value: ''},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.NoDamage@', value: '0 No Damage'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.Peeling@', value: '1 Peeling'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.HarvestDamage@', value: '2 Harvest Damage'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.TopBroken@', value: '3 Top Broken'},
                                                      {text: '@treeapp.view.TreeDetail.TreeDamage.OtherDamage@', value: '4 Other damage'}
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
                        text: '@treeapp.view.NewTree.saveObervationButtonLabel@',
                        ui: 'round',
                        hidden: true
                    },
                    {
                        xtype: 'button',
                        id: 'submitobservationbutton',
                        text: '@treeapp.view.TreeObservation.saveObervationButtonLabel@',
                        ui: 'round',
                        hidden: true
                    }
                ]
            }
        ]
    }
});
