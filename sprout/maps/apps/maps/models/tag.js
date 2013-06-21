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
Maps.TagPaletteColors = ["#D7191C","#FDAE61","#ABDDA4","#2B83BA"];
Maps.StrokePaletteColors = ['#000', '#000', '#000', '#000'];
// june/2013: moved to a more visible palette, considering a white border
//Maps.TagPaletteColors = ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'];
//Maps.StrokePaletteColors = ['#3F6C3F', '#3F6C3F', '#3F6C3F', '#3F6C3F'];

Maps.TagPaletteStyles = ['tag0', 'tag1', 'tag2', 'tag3'];