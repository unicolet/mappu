/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.geoCodeState = SC.State.extend({
    enterState: function(ctx) {
        Maps.addressController.findAddresses(Maps.openLayersController.get("lat"), Maps.openLayersController.get("lon"));
        Maps.mainPage.addressPane.append();
    },

    close: function() {
        this.gotoState("browsingMapState");
    },

    exitState: function(ctx) {
        Maps.mainPage.addressPane.remove();
    }
});
