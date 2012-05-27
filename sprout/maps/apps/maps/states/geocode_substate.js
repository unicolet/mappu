/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.geoCodeState = SC.State.extend({
    enterState: function(ctx) {
        Maps.addressController.findAddresses(Maps.openLayersController.get("lat"), Maps.openLayersController.get("lon"));
        var pane = Maps.getPath('mainPage.addressPane');
        pane.adjust("opacity", 0);
        pane.append();
        pane.animate("opacity", 1, 0.5);
    },

    close: function() {
        this.gotoState("browsingMapState");
    },

    exitState: function(ctx) {
        var pane = Maps.getPath('mainPage.addressPane');
        pane.animate("opacity", 0, 0.3, function(){ pane.remove();});
    }
});
