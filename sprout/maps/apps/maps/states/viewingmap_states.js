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
        console.log("*** viewingMapState.enter ***");

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
        if(!selectedFeature) return;
        var hasSocial=selectedFeature.get("social");
        var selectionIndex = Maps.featureInfoController.indexOf(selectedFeature);
        var view = listView.itemViewForContentIndex(selectionIndex);

        if(hasSocial) {
            Maps.socialController.set("content", selectedFeature.get("social"));
            Maps.socialCommentsController.findComments();
        } else {
            Maps.socialController.set("content", null);
        }
        // always fetch links
        Maps.linkController.findLinks();
        this.gotoState("showingFeatureResultPaneState", {targetView:view});
    },

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
            this.gotoState("showingGeoToolsState");
            view.set("value", "toolMove");
        }
        if (tool == 'toolExplorer') {
            this.gotoState("showingTagExplorerState");
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

    showingFeatureResultPaneState: SC.State.plugin("Maps.showingFeatureResultPaneState"),

    showingGeoToolsState: SC.State.extend({
        enterState: function() {
            var splitView=Maps.mainPage.get("splitView");
            Maps.openLayersController.clearGeoToolsSelection();

            splitView.middleRightView.set("nowShowing", "Maps.mainPage.geotoolsPane");

            if (splitView.middleRightView.get("size") == 0)
                splitView.expandToLeft(splitView.middleRightView, 160);
            else
                splitView.collapseToRight(splitView.middleRightView);
        },
        exitState: function() {
            var splitView=Maps.mainPage.get("splitView");
            splitView.collapseToRight(splitView.middleRightView);
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
                Maps.openLayersController.set("measure","Area: "+Math.round(payload['area'])+" m<sup>2</sup>");
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
            this.gotoState("browsingMapState");
        }
    }),

    showingTagExplorerState: SC.State.extend({
        enterState: function(ctx) {
            var splitView=Maps.mainPage.get("splitView");
            Maps.tagsController.set('content', Maps.store.find(Maps.TAGSUMMARY_QUERY));
            splitView.labelExplorer.set("nowShowing", "Maps.mainPage.explorerPane");

            if (splitView.labelExplorer.get("size") == 0) {
                splitView.expandToRight(splitView.labelExplorer, 200);
                Maps.tagsController.refreshTagsLayer();
            } else {
                splitView.collapseToLeft(splitView.labelExplorer);
                Maps.tagsController.hideTagsLayer();
            }
        },
        didClickOnTools: function(view) {
            var tool = view.get("value");

            if (tool == 'toolExplorer') {
                view.set("value", "toolMove");
                this.gotoState("browsingMapState");
            } else {
                // bubble up
                this.parentState.didClickOnTools(view);
            }
        },
        exitState: function() {
            var splitView=Maps.mainPage.get("splitView");
            splitView.collapseToLeft(splitView.labelExplorer);
            Maps.tagsController.hideTagsLayer();
        },
        maps_RenderTags: function() {
            Maps.tagsController.gatherTagPoints();
        },
        maps_ReloadTags: function() {
            Maps.tagsController.get("content").refresh();
            Maps.tagsController.hideTagsLayer();
        }
    }),

    geoCodeState:SC.State.plugin('Maps.geoCodeState'),

    printingMapState: SC.State.plugin('Maps.printingMapState')
});