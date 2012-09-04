/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.viewingMapState = SC.State.extend({
    substatesAreConcurrent: NO,

    initialSubstate:'browsingMapState',

    enterState:function () {
        //@if(debug)
        console.log("*** viewingMapState.enter ***");
        //@endif

        Maps.getPath('loginPage.mainPane').remove();

        var page = Maps.getPath('mainPage.mainPane');
        // prepare animation
        page.disableAnimation();
        page.adjust("opacity", 0).updateStyle();
        // append
        page.append();
        page.enableAnimation();
        // perform animation
        page.adjust("opacity", 1);

        SC.routes.add('zoom/:lat/:lon/:level', Maps, Maps.zoomRoute);
        SC.routes.add('find/:layer/:query', Maps, Maps.findRoute);

        Maps.openLayersController.set('content', Maps.openLayersController.get("tmp"));

        var queries = Maps.store.find(Maps.LAYERQUERY_QUERY);
        Maps.layerQueryController.set('content', queries);

        var attributes = Maps.store.find(Maps.ATTRIBUTES_QUERY);
        Maps.featureInfoAttributesController.set('content', attributes);

        // load all links from database. From now on only in-memory queries
        Maps.store.find(Maps.LINK_QUERY);

        // now start the keep session alive timer
        Maps.authenticationManager.startSessionKeepAlive();

        Maps.progressPane.remove();

        Maps.usageTipController.maybeShowTips();
    },

    exitState:function () {
        var page = Maps.getPath('mainPage.mainPane');
        // prepare animation
        page.adjust("opacity", 0);
        // append
        setTimeout(function () {
            page.remove();
        }, 1500);

        Maps.openLayersController.set('content', null);
        Maps.authenticationManager.set('content', null);
        Maps.layerQueryController.set('content', null);
        Maps.featureInfoAttributesController.set('content', null);

        Maps.openLayersController.destroyOpenLayersMap();
        Maps.authenticationManager.stopSessionKeepAlive();
    },

    /**
     * Invoked when the user selectes the help button from the username menu.
     * Causes a sheet pane to appear with some help text.
     */
    helpOpen: function() {
        Maps.helpSheetPane.append();
    },

    /**
     * Invoked when the user selectes the tips button from the username menu.
     * Causes a sheet pane to appear with usage tips.
     */
    tipsOpen: function() {
        Maps.usageTipController.maybeShowTips(true);
    },

    /**
     * Closes the sheet pane, animating the slide up.
     */
    helpClose: function() {
        Maps.helpSheetPane.remove();
    },

    /* Invoked when the user chooses to logout from the user menu */
    logout: function(){
        Maps.authenticationManager.logout();
    },

    /* callback to logout */
    didLogout:function () {
        this.gotoState('notLoggedIn');
    },

    didChooseLayersOrSearch: function(view) {
        if(view.get("value")=="LAYERS")
            this.gotoState('showingLayersPaneState');
        if(view.get("value")=="SEARCH")
            this.gotoState('showingSearchPaneState');
    },

    clearQueryResults: function() {
        Maps.openLayersController.clearFeatures();
        Maps.featureInfoAttributesController.clearFeatureAttributes();
    },

    // called when the user dblclicks an item in list view
    maps_featureSelected: function(listView) {
        var selectedFeature = Maps.featureInfoController.get("selection").firstObject();
        if(!selectedFeature) {
            Maps.socialController.set("content",null);
            Maps.socialCommentsController.findComments("-1");
            Maps.linkController.set("content",null);
        } else {
            var hasSocial=selectedFeature.get("social");

            if(hasSocial) {
                Maps.socialController.set("content", selectedFeature.get("social"));
                Maps.socialCommentsController.findComments(selectedFeature.getSocialID());
            } else {
                Maps.socialController.set("content", null);
                Maps.socialCommentsController.findComments("-1");
            }
            // fetch links
            Maps.linkController.findLinks();
        }
    }.observes("Maps.featureInfoController.selection"),

    didClickOnTools: function(view) {
        var tool = view.get("value");

        if (tool == 'toolMove') {
            Maps.openLayersController.getOLView().toolMove();
            // clear last measure
            Maps.openLayersController.set('measure', '');
        }
        if (tool == 'toolArea') {
            Maps.openLayersController.getOLView().toolArea();
        }
        if (tool == 'toolLength') {
            Maps.openLayersController.getOLView().toolLength();
        }
        if (tool == 'toolGeo') {
            this.toggleGeoTools();
            view.set("value", "toolMove");
        }
        if (tool == 'toolExplorer') {
            this.toggleTagExplorer();
            view.set("value", "toolMove");
        }
    },

    print: function(){
        this.gotoState("printingMapState");
    },

    doOpenLayerWithGoogleEarth: function() {
        var ws=Maps.layerController.get("name").split(":")[0];
        window.open("/geoserver/"+ws+"/wms/kml?layers="+Maps.layerController.get("name"))
    },

    /*
     * Use the gmaps api to reverse geocode a lat,lon couple
     */
    geocode: function() {
        this.gotoState("geoCodeState");
    },

    /*
     * launch streetview in a browser window
     */
    streetview: function() {
        window.open("http://maps.google.it/?ll="+Maps.openLayersController.get("lat")+","+Maps.openLayersController.get("lon")+"&t=m&z=19&vpsrc=6", "mappu_gmaps");
    },

    toggleTagExplorer: function() {
        if(Maps.mainPage.explorerPane.get("isVisibleInWindow")) {
            this.hideTagEplorer();
        } else {
            this.showTagEplorer();
        }
    },

    showTagEplorer: function() {
        Maps.tagsController.set('content', Maps.store.find(Maps.TAGSUMMARY_QUERY));
        Maps.mainPage.explorerPane.append();
        Maps.mainPage.explorerPane.animate({left:0}, 0.2);

        if (Maps.mainPage.explorerPane.get("isVisible")==NO) {
            Maps.tagsController.refreshTagsLayer();
        } else {
            Maps.tagsController.hideTagsLayer();
        }
    },
    hideTagEplorer: function() {
        var newLayout=Maps.mainPage.explorerPane.layout;
        Maps.mainPage.explorerPane.animate({left:-210}, 0.2, function () {
            Maps.mainPage.explorerPane.remove();
        });
        Maps.tagsController.hideTagsLayer();
    },
    maps_RenderTags: function() {
        Maps.tagsController.gatherTagPoints();
    },
    maps_ReloadTags: function() {
        Maps.tagsController.get("content").refresh();
        Maps.tagsController.hideTagsLayer();
    },

    toggleGeoTools: function() {
        if(Maps.mainPage.geotoolsPane.get("isVisibleInWindow")) {
            this.hideGeoTools();
        } else {
            this.showGeoTools();
        }
    },
    showGeoTools: function() {
        Maps.mainPage.geotoolsPane.append();
        setTimeout(function () {
            SC.run(function () { Maps.mainPage.geotoolsPane.animate({right:Maps.mainPage.get("rightSplitPane").size+10}, 0.2); });
        },0);
    },
    hideGeoTools: function() {
        Maps.mainPage.geotoolsPane.animate({right:-180}, 0.2, function () {
            Maps.mainPage.geotoolsPane.remove();
        });
    },
    maps_PerformGeoOperation: function() {
        var op = Maps.featureInfoController.get("operation");
        var geom1 = Maps.featureInfoController.get("feature1geom");
        var geom2 = Maps.featureInfoController.get("feature2geom");
        if (!geom1 && !geom2) {
            SC.AlertPane.warn("_missing_params".loc(), "_select_features".loc() + op, "", "OK", this);
        } else {
            if (!geom2) {
                geom2 = "";
            }
            if (!geom1) {
                geom1 = "";
            }
            SC.Request.postUrl("/mapsocial/jts/" + op.toLowerCase(), null).notify(this, 'didPerformGeoOperation').send(geom1.toString() + "*" + geom2.toString());
        }
    },
    didPerformGeoOperation: function(response) {
        if (SC.ok(response)) {
            var payload=null;
            if (!response.isJSON())
                payload = SC.$.parseJSON(response.get('body'));
            else
                payload = response.get("body");
            var WKTParser = new OpenLayers.Format.WKT();
            var features = WKTParser.read(payload['geom']);
            Maps.openLayersController.set("measure","Area: "+Maps.formatArea(payload['area']));
            if (features) {
                Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
                Maps.openLayersController.getGeotoolsLayer().addFeatures(features);
            }
        } else {
            SC.AlertPane.warn("_op_failed".loc(), response.get("rawRequest").statusText, 'Error code: ' + response.get("rawRequest").status, "OK", this);
        }
    },

    maps_PerformGeoClear: function() {
        Maps.openLayersController.clearGeoToolsSelection();
        Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
    },
    maps_PerformGeoClose: function() {
        this.toggleGeoTools();
    },

    /* Moved here when I removed the FeatureInfo Pickerpane */
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


    /*******************************************************
     *
     *                     SUB STATES
     *
     *******************************************************/

    browsingMapState: SC.State.extend({
        // this state is the main state when the user is mostly interacting with map
        // all ui has been created when the user entered its parent state
    }),

    showingLayersPaneState: SC.State.plugin("Maps.showingLayersPaneState"),

    showingSearchPaneState: SC.State.plugin("Maps.showingSearchPaneState"),

    geoCodeState:SC.State.plugin('Maps.geoCodeState'),

    printingMapState: SC.State.plugin('Maps.printingMapState')
});