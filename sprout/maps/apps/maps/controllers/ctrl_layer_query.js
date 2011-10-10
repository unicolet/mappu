/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.layerQueryController = SC.ArrayController.create(
/** @scope Maps.layerQueryController.prototype */ {

    getCQLFilter: function() {
        return Maps.mainPage.queryEditPane.form.getCQLFilter();
    },

    getTypeName: function() {
        return this.get("selection").firstObject().get("layer");
    }
}) ;
