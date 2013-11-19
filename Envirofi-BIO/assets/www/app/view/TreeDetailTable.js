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
                    '<tr><td class="keycell">{user} at {time}</td><td class="valuecell"></td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.treenumber)">',
                    '<tr><td class="keycell">Tree Number:</td><td class="valuecell">{treenumber}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.street)">',
                    '<tr><td id="street_{treenumber}" class="keycell rateable">Street:</td><td class="valuecell">{street}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lon) && this.isNumber(values.lon)">',
                    '<tr><td class="keycell">Longitude:</td><td class="valuecell">{lon}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lat) && this.isNumber(values.lat)">',
                    '<tr><td class="keycell">Latitude:</td><td class="valuecell">{lat}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.alt) && this.isNumber(values.alt)">',
                    '<tr><td class="keycell">Altitude:</td><td class="valuecell">{alt}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.area)">',
                    '<tr><td class="keycell">Area:</td><td class="valuecell">{area}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.provider)">',
                    '<tr><td class="keycell">Data Provider:</td><td class="valuecell">{provider}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.height) && this.isNumber(values.height)">',
                	'<tr><td id="height_{treenumber}" class="keycell rateable">Height [m]:</td><td class="valuecell">{height}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.diameter) && this.isNumber(values.diameter)">',
                    '<tr><td class="keycell">Crown Diameter [m]:</td><td class="valuecell">{diameter}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.name)">',
                    '<tr><td class="keycell">Species Name:</td><td class="valuecell">{name}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.commonname)">',
                    '<tr><td class="keycell">Common Name:</td><td class="valuecell">{commonname}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.probability)">',
                    '<tr><td class="keycell">Species Probability:</td><td class="valuecell">{probability}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.year) && this.isNumber(values.year)">',
                    '<tr><td class="keycell">Planting Year:</td><td class="valuecell">{year}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.circumference) && this.isNumber(values.circumference)">',
                    '<tr><td class="keycell">Trunk Circumference [cm]:</td><td class="valuecell">{circumference}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.bhd) && this.isNumber(values.bhd)">',
                    '<tr><td class="keycell">Diameter at Breast Height (DBH) [cm]:</td><td class="valuecell">{bhd}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.comment)">',
                    '<tr><td class="keycell">Comment</td><td class="valuecell">{comment}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.image)">',
                    '<tr><td colspan="2" class="imagecell picture"><img id={_id} src="data:image/jpeg;base64,{image}"></td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.image)">',
                    '<tr><td class="keycell">Image Type</td><td class="valuecell">{imagetype}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.imagecomment)">',
                    '<tr><td class="keycell">Comment for image</td><td class="valuecell">{imagecomment}</td></tr>',
                '</tpl>',               
                '<tpl if="this.isValid(values.azimut) && this.isNumber(values.azimut)">',
                    '<tr><td class="keycell">Azimut [°]</td><td class="valuecell">{azimut}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.distance) && this.isNumber(values.distance)">',
                    '<tr><td class="keycell">Distance [m]</td><td class="valuecell">{distance}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.referencepoint)">',
                    '<tr><td class="keycell">Reference Point</td><td class="valuecell">{referencepoint}</td></tr>',
                '</tpl>',
//                '<tpl if="this.isValid(values.gk_easting) && this.isNumber(values.gk_easting)">',
//                    '<tr><td class="keycell">GK Easting</td><td class="valuecell">{gk_easting}</td></tr>',
//                '</tpl>',
//                '<tpl if="this.isValid(values.gk_northing) && this.isNumber(values.gk_northing)">',
//                    '<tr><td class="keycell">GK Northing</td><td class="valuecell">{gk_northing}</td></tr>',
//                '</tpl>',
                '<tpl if="this.isValid(values.crowningheight) && this.isNumber(values.crowningheight)">',
                    '<tr><td class="keycell">Crowning Height [m]</td><td class="valuecell">{crowningheight}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.deadwoodheight) && this.isNumber(values.deadwoodheight)">',
                    '<tr><td class="keycell">Deadwood Height [m]</td><td class="valuecell">{deadwoodheight}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.socialposition)">',
                    '<tr><td class="keycell">Social Position (Kraft)</td><td class="valuecell">{socialposition}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.statusforestinventory)">',
                    '<tr><td class="keycell">Tree Status Forest Inventory</td><td class="valuecell">{statusforestinventory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.statussiteinventory)">',
                    '<tr><td class="keycell">Tree Status Site Inventory</td><td class="valuecell">{statussiteinventory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.barkbeetledate)">',
                    '<tr><td class="keycell">Barkbeetle Infestation - Event Date</td><td class="valuecell">{barkbeetledate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.barkbeetleaccuracy) && this.isNumber(values.barkbeetleaccuracy)">',
                    '<tr><td class="keycell">Barkbeetle Infestation - Accuracy Event Date [Years]</td><td class="valuecell">{barkbeetleaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamagecategory)">',
                    '<tr><td class="keycell">Wind Damage - Category</td><td class="valuecell">{winddamagecategory}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamagedate)">',
                    '<tr><td class="keycell">Wind Damage - Event Date</td><td class="valuecell">{winddamagedate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.winddamageaccuracy) && this.isNumber(values.winddamageaccuracy)">',
                    '<tr><td class="keycell">Wind Damage - Accuracy Event Date [Years]</td><td class="valuecell">{winddamageaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lightchangesdate)">',
                    '<tr><td class="keycell">Light Changes - Event Date</td><td class="valuecell">{lightchangesdate}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.lightchangesaccuracy) && this.isNumber(values.lightchangesaccuracy)">',
                    '<tr><td class="keycell">Light Changes - Accuracy Event Date [Years]</td><td class="valuecell">{lightchangesaccuracy}</td></tr>',
                '</tpl>',
                '<tpl if="this.isValid(values.treedamage)">',
                    '<tr><td class="keycell">Tree damage (1-n)</td><td class="valuecell">{treedamage}</td></tr>',
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
