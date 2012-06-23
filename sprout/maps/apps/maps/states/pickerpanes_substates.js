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
            Maps.mainPage.layerPalette.disableAnimation();
            Maps.mainPage.layerPalette.adjust("opacity", 0).updateStyle();
            // append
            Maps.mainPage.layerPalette.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
            Maps.mainPage.layerPalette.enableAnimation();
            // perform animation
            Maps.mainPage.layerPalette.adjust("opacity", 1);
        } else {
            Maps.mainPage.layerPalette.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
        }
        Maps.openLayersController.goToDetail();
    },

    didCloseLayerPalette:function () {
        this.gotoState("browsingMapState");
    },

    showAdvancedOptions:function () {
        window.open(APPCONFIG.advanced_options);
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
            Maps.mainPage.layerSearchPane.disableAnimation();
            Maps.mainPage.layerSearchPane.adjust("opacity", 0).updateStyle();
            // append
            Maps.mainPage.layerSearchPane.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
            Maps.mainPage.layerSearchPane.enableAnimation();
            // perform animation
            Maps.mainPage.layerSearchPane.adjust("opacity", 1);
        } else {
            Maps.mainPage.layerSearchPane.popup(Maps.mainPage.get("layersAndSearch"), SC.PICKER_POINTER);
        }
        Maps.openLayersController.goToListQuery();
    },

    didCloseSearchPalette:function () {
        this.gotoState("browsingMapState");
    },

    maps_GoToEditQuery:function () {
        Maps.openLayersController.goToEditQuery();
    },

    layerQueryBack:function () {
        Maps.openLayersController.goToListQuery();
    },

    layerQueryRun:function () {
        var wfs = new OpenLayers.Protocol.HTTP({
            url:WMSCONFIG.wfs_server_path + "?service=wfs&version=1.0&request=GetFeature&typename=" + Maps.layerQueryController.getTypeName(),
            format:new OpenLayers.Format.GML.v3({})
        });

        // start spinner
        Maps.set("isLoading", YES);

        wfs.read({
            params:{
                "CQL_FILTER":Maps.layerQueryController.getCQLFilter()
            },
            callback:this.didFetchWfsFeatures
        });
    },

    didFetchWfsFeatures:function (response, options) {
        try {
            var gml = new OpenLayers.Format.GML({extractAttributes:true});
            response.features = gml.read(response.priv.responseXML);
            Maps.openLayersController.showInfo(response);
        } catch (e) {
            SC.AlertPane.warn("_op_failed".loc(), response.error, '_no_info_avail'.loc(), "OK", this);
        }
        // stop spinner
        Maps.set("isLoading", NO);
    },

    exitState:function () {
        // can't animate pp removal, sob
        Maps.mainPage.layerSearchPane.remove();
        Maps.mainPage.get("layersAndSearch").set("value", "");
    }
});

Maps.showingFeatureResultPaneState = SC.State.extend({
    enterState:function (ctx) {
        var pickerPane = Maps.mainPage.featureResultPane;
        // prepare animation
        pickerPane.disableAnimation();
        pickerPane.adjust("opacity", 0).updateStyle();
        // append
        pickerPane.popup(ctx.targetView, SC.PICKER_POINTER);
        pickerPane.enableAnimation();
        // perform animation
        pickerPane.adjust("opacity", 1);
    },

    didCloseFeatureResultPane:function () {
        this.gotoState("browsingMapState");
    },

    maps_SaveTags:function () {
        var feature = Maps.featureInfoController.get("selection").firstObject();
        Maps.socialController.saveTags(feature);
    },

    maps_AddComment:function (view) {
        Maps.socialCommentsController.addComment(view);
    },

    maps_DelComment:function () {
        Maps.socialCommentsController.delComment();
    },

    exitState:function () {
        // can't animate pp removal, sob
        Maps.mainPage.featureResultPane.remove();
    }
});
