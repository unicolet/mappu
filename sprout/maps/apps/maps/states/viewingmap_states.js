/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.viewingMapState = SC.State.extend({

    logout:function () {
        this.gotoState('notLoggedIn');
    },

    enterState:function () {
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
    }
});