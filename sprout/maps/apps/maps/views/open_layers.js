// ==========================================================================
// Project:   Maps.OpenLayers
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document Your View Here)

  @extends SC.View
*/


var size = new OpenLayers.Size(21, 25);
var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
var iconSelected = new OpenLayers.Icon(sc_static('/images/pin_selected.png'), size, offset);
var icon = new OpenLayers.Icon(sc_static('/images/pin.png'), size, offset);
var currentMarker = null;

Maps.OpenLayers = SC.View.extend(
/** @scope Maps.OpenLayers.prototype */ {

	render: function(context, firstTime) {
	    sc_super();
	}

});
