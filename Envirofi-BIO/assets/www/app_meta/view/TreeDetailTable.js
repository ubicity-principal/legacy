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
  * @file app/view/TreeDetailTable.js
  * @authors Clemens Bernhard Geyer, Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Sencha Touch view for display of tree and observation details.
  */
Ext.define('treeapp.view.TreeDetailTable', {
	extend: 'Ext.Panel',
    xtype: 'treedetailtable',

    config: {
        styleHtmlContent: true,
        margin: '0 0 0 0',
        padding: '0,0,0,0',
        tpl: Ext.create('Ext.XTemplate',
                '<div><table>',
                '<tpl if="this.isValid(values.user) && this.isValid(values.time)">',
                    '<tr><td class="keycell">@treeapp.view.TreeComment.userInfo@</td><td class="valuecell"></td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.treenumber)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.TreeNumberLabel@:</td><td class="valuecell">{treenumber}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.street)">',
                    '<tr><td id="street_{treenumber}" class="keycell rateable">@treeapp.view.TreeDetail.StreetLabel@:</td><td class="valuecell">{street}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lon) && this.isNumber(values.lon)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.GPSLabelLong@:</td><td class="valuecell">{lon}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lat) && this.isNumber(values.lat)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.GPSLabelLat@:</td><td class="valuecell">{lat}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.alt) && this.isNumber(values.alt)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.GPSLabelAlt@:</td><td class="valuecell">{alt}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.area)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.AreaLabel@:</td><td class="valuecell">{area}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.provider)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.DataProviderLabel@:</td><td class="valuecell">{provider}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.height) && this.isNumber(values.height)">',
                	'<tr><td id="height_{treenumber}" class="keycell rateable">@treeapp.view.TreeDetail.HeightLabel@:</td><td class="valuecell">{height}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.diameter) && this.isNumber(values.diameter)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.CrownDiameterLabel@:</td><td class="valuecell">{diameter}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.name)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.SpeciesNameLabel@:</td><td class="valuecell">{name}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.commonname)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.CommonNameLabel@:</td><td class="valuecell">{commonname}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.probability)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.SpeciesProbabilityLabel@:</td><td class="valuecell">{probability}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.year) && this.isNumber(values.year)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.PlantingYearLabel@:</td><td class="valuecell">{year}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.circumference) && this.isNumber(values.circumference)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.TrunkCircumferenceLabel@:</td><td class="valuecell">{circumference}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.bhd) && this.isNumber(values.bhd)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.TrunkDiameterLabel@:</td><td class="valuecell">{bhd}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.comment)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.CommentLabel@</td><td class="valuecell">{comment}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.image)">',
                    '<tr><td colspan="2" class="imagecell picture"><img id={_id} src="data:image/jpeg;base64,{image}"></td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.image)">',
                    '<tr><td class="keycell">@treeapp.view.TreeComment.imageType@</td><td class="valuecell">{imagetype}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.imagecomment)">',
                    '<tr><td class="keycell">@treeapp.view.TreeObservation.ImageCommentLabel@</td><td class="valuecell">{imagecomment}</td></tr>',
                '</tpl>',               
                '<tpl if="this.isValid(values.azimut) && this.isNumber(values.azimut)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.Azimut@</td><td class="valuecell">{azimut}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.distance) && this.isNumber(values.distance)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.Distance@</td><td class="valuecell">{distance}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.referencepoint)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.Refpoint@</td><td class="valuecell">{referencepoint}</td></tr>',
                '</tpl>',
//                '<tpl if="this.isValid(values.gk_easting) && this.isNumber(values.gk_easting)">',
//                    '<tr><td class="keycell">@treeapp.view.TreeDetail.GKLabelEast@</td><td class="valuecell">{gk_easting}</td></tr>',
//                '</tpl>',
//                '<tpl if="this.isValid(values.gk_northing) && this.isNumber(values.gk_northing)">',
//                    '<tr><td class="keycell">@treeapp.view.TreeDetail.GKLabelNorth@</td><td class="valuecell">{gk_northing}</td></tr>',
//                '</tpl>',
                '<tpl if="this.isValid(values.crowningheight) && this.isNumber(values.crowningheight)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.CrowningHeightLabel@</td><td class="valuecell">{crowningheight}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.deadwoodheight) && this.isNumber(values.deadwoodheight)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.DeadwoodHeightLabel@</td><td class="valuecell">{deadwoodheight}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.socialposition)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.SocialPositionLabel@</td><td class="valuecell">{socialposition}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.statusforestinventory)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.ForestInventoryLabel@</td><td class="valuecell">{statusforestinventory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.statussiteinventory)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.SiteInventoryLabel@</td><td class="valuecell">{statussiteinventory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.barkbeetledate)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.BarkbeetleLabel@ - @treeapp.view.TreeDetail.Barkbeetle.EventDate@</td><td class="valuecell">{barkbeetledate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.barkbeetleaccuracy) && this.isNumber(values.barkbeetleaccuracy)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.BarkbeetleLabel@ - @treeapp.view.TreeDetail.Barkbeetle.AccuracyEventDate@</td><td class="valuecell">{barkbeetleaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamagecategory)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.WindDamageLabel@ - @treeapp.view.TreeDetail.WindDamage.Category@</td><td class="valuecell">{winddamagecategory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamagedate)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.WindDamageLabel@ - @treeapp.view.TreeDetail.WindDamage.EventDate@</td><td class="valuecell">{winddamagedate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamageaccuracy) && this.isNumber(values.winddamageaccuracy)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.WindDamageLabel@ - @treeapp.view.TreeDetail.WindDamage.AccuracyEventDate@</td><td class="valuecell">{winddamageaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lightchangesdate)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.LightChangesLabel@ - @treeapp.view.TreeDetail.LightChanges.EventDate@</td><td class="valuecell">{lightchangesdate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lightchangesaccuracy) && this.isNumber(values.lightchangesaccuracy)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.LightChangesLabel@ - @treeapp.view.TreeDetail.LightChanges.AccuracyEventDate@</td><td class="valuecell">{lightchangesaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.treedamage)">',
                    '<tr><td class="keycell">@treeapp.view.TreeDetail.TreeDamage@</td><td class="valuecell">{treedamage}</td></tr>',
                '</tpl>',

                '</table></div>',
                {
                    // member functions:
                    isValid: function(name){
/*                        if (name == null) {
                            console.log("name is null");
                        }
                        else if (name == "") {
                            console.log("name is empty");
                        }
                        else {
                            console.log("name: " + name);
                        }
*/                       return ((name !== null) && (name !== undefined) && (name !== "") && (name !== 'undefined') && (name != "N/A"));
                    },
                    isNumber: function(name){
                        return (!isNaN(name));
                    }
                }
            ),
            listeners: [
                {
                    element: 'element',
                    delegate: 'td.rateable',
                    event: 'tap',
                    fn: function(evt, elem){
                    	var id = elem.id;
                    	var id_split = id.split('_');
                    	if(id_split.length == 2){
                    		openPropertyFromTree(id_split[0], id_split[1]);
                    	} else {
                    		console.log("Error with splitting id!!!");
                    	}
                    }
                },
                {
                    element: 'element',
                    delegate: 'td.picture',
                    event: 'tap',
                    fn: function(evt, elem){
                        var id = elem.id;
                        loadImage(id);
                    }
                }

            ]
      }
});
