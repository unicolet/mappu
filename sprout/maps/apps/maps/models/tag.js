/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.Tag = SC.Record.extend(
/** @scope Maps.Tag.prototype */ {
	tag: SC.Record.attr(String),
	occurrences: SC.Record.attr(Number),
    visible: SC.Record.attr(Boolean),

    paletteColor: null,

    resetPaletteColor: function() {
        this.set("paletteColor",null);
    },

    applyPaletteColor: function(idx) {
        if(idx>=0 && idx<Maps.TagPaletteStyles.length)
            this.set("paletteColor",Maps.TagPaletteStyles[idx]);
    }
}) ;

// Visit http://colorbrewer2.org/ for more schemes
// Permalink for this one: http://colorbrewer2.org/index.php?type=sequential&scheme=YlGnBu&n=4
Maps.TagPaletteColors = ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'];
Maps.TagPaletteStyles = ['tag0', 'tag1', 'tag2', 'tag3'];