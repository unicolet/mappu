/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
/*globals Maps */

Maps.main = function main() {

};

SC.ready(function() {
    Maps.initProjections();

    Maps.statechart.initStatechart();

    // quick fix for https://github.com/sproutcore/sproutcore/issues/1097
    SC.platform.touch=NO;
});
