// ==========================================================================
// Project:   Maps.layerQueryController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
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
