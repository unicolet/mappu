/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/


Maps.showingLayersPaneState = SC.State.extend({
    enterState:function () {
        if (!SC.browser.isIE) {
            // prepare animation
            Maps.mainPage.layerPalette.adjust("opacity", 0);
            // append
            Maps.mainPage.layerPalette.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
            // perform animation
            Maps.mainPage.layerPalette.animate({opacity:1}, 0.5);
        } else {
            Maps.mainPage.layerPalette.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
        }
        Maps.openLayersController.goToDetail();
    },

    didCloseLayerPalette:function () {
        this.gotoState("browsingMapState");
    },

    showAdvancedOptions:function () {
        this.gotoState("appManagementState");
    },

    legend:NO,
    toggleLegend:function () {
        if (!this.legend)
            Maps.openLayersController.goToLegend();
        else
            Maps.openLayersController.goToDetail();
        this.legend = !this.legend;
    },

    doRemoveFilter:function () {
        var layer = Maps.openLayersController.get("selection").firstObject();
        if (layer)
            layer.set("cql_filter", null);
    },

    exitState:function () {
        // can't animate pp removal, sob
        Maps.mainPage.layerPalette.remove();
        Maps.mainPage.get("layersAndSearch").set("value", "");
    }
});

Maps.showingSearchPaneState = SC.State.extend({
    enterState:function () {
        if (!SC.browser.isIE) {
            // prepare animation
            Maps.mainPage.layerSearchPane.adjust("opacity", 0);
            // append
            Maps.mainPage.layerSearchPane.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER,[3, 0, 1, 2, 3]);
            Maps.mainPage.layerSearchPane.animate({opacity:1}, 0.5);
        } else {
            Maps.mainPage.layerSearchPane.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER,[3, 0, 1, 2, 3]);
        }
        Maps.openLayersController.goToListQuery();
    },

    didCloseSearchPalette:function () {
        this.gotoState("browsingMapState");
    },

    maps_GoToEditQuery:function (view) {
        if(Maps.layerQueryController.get("selection").firstObject()) {
            Maps.openLayersController.goToEditQuery();
        }
    },

    layerQueryBack:function () {
        Maps.openLayersController.goToListQuery();
    },

    layerQueryRun:function () {
        Maps.layerQueryController.layerQuery(Maps.layerQueryController.getTypeName(), Maps.layerQueryController.getCQLFilter());
    },

    exitState:function () {
        // can't animate pp removal, sob
        Maps.mainPage.layerSearchPane.remove();
        Maps.mainPage.get("layersAndSearch").set("value", "");
    }
});