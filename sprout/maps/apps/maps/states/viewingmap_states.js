/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.viewingMapState = SC.State.extend({
    substatesAreConcurrent: NO,

    initialSubstate:'browsingMapState',

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

    logout: function(){
        Maps.authenticationManager.logout();
    },

    didLogout:function () {
        this.gotoState('notLoggedIn');
    },

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

    /*******************************************************
     *
     *                     SUB STATES
     *
     *******************************************************/

    browsingMapState: SC.State.extend({
        // this state is the main state when the user is mostly interacting with map
        // all ui has been created when the user entered its parent state
    }),

    showingLayersPaneState: SC.State.extend({
        enterState: function() {
            if(!SC.browser.isIE) {
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

        didCloseLayerPalette: function() {
            this.gotoState("browsingMapState");
        },

        exitState: function() {
            // can't animate pp removal, sob
            Maps.mainPage.layerPalette.remove();
            Maps.mainPage.get("layersAndSearch").set("value","");
        }
    }),

    showingSearchPaneState: SC.State.extend({
        enterState: function() {
            if(!SC.browser.isIE) {
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

        didCloseSearchPalette: function() {
            this.gotoState("browsingMapState");
        },

        exitState: function() {
            // can't animate pp removal, sob
            Maps.mainPage.layerSearchPane.remove();
            Maps.mainPage.get("layersAndSearch").set("value","");
        }
    }),

    showingFeatureResultPaneState: SC.State.extend({
        enterState: function(ctx) {
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

        didCloseFeatureResultPane: function() {
            this.gotoState("browsingMapState");
        },

        exitState: function() {
            // can't animate pp removal, sob
            Maps.mainPage.featureResultPane.remove();
        }
    }),

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
                Maps.mainPage.mainPane.splitview.collapseToLeft(splitView.labelExplorer);
                Maps.tagsController.hideTagsLayer();
            }

        },
        exitState: function() {

        },
        maps_RenderTags: function() {
            Maps.tagsController.gatherTagPoints();
        },
        maps_ReloadTags: function() {
            Maps.tagsController.get("content").refresh();
            Maps.tagsController.hideTagsLayer();
        }
    })
});