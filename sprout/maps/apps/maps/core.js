/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/** @namespace

 My cool new app.  Describe your application.

 @extends SC.Object
 */
Maps = SC.Application.create(
    /** @scope Maps.prototype */ {

    NAMESPACE: 'Maps',
    VERSION: '0.1.0',

    // This is your application store.  You will use this store to access all
    // of your model data.  You can also set a data source on this store to
    // connect to a backend server.  The default setup below connects the store
    // to any fixtures you define.
    wmsStore: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.LayerDataSource'),
    store: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.MapsDataSource'),

    isLoading: NO,
    bbox: null,

    print: function() {
        Maps_print();
    },

    projections: {},

    initProjections: function() {
        // add decent error reporting into proj4js
        Proj4js.reportError=function(msg){console.log(msg);};

        Maps.projections['EPSG:3003'] = new OpenLayers.Projection('EPSG:3003');
        Maps.projections['EPSG:900913'] = new OpenLayers.Projection('EPSG:900913');
        Maps.projections['EPSG:4326'] = new OpenLayers.Projection('EPSG:4326');
    },

    /**
     * This controls whether the app, when teh capabilities have been read, should zoom
     * to the capabilites extent. Can be overridden by the zoom route, below.
     */
    shouldZoom: YES,

    /**
     * Handle routing notificartons
     * @param route
     */
    zoomRoute: function(route) {
        if(route && route.lat && route.lon) {
            console.log("Zoooming to: "+route.lat+","+route.lon+" level="+route.level);
            var center=new OpenLayers.LonLat(route.lon, route.lat).transform(Maps.projections['EPSG:4326'], Maps.projections['EPSG:900913']);
            Maps.openLayersController.getOLMAP().setCenter(center, (route.level?route.level:15) );
            Maps.set("shouldZoom",NO);
        }
    },

    findRoute: function(route) {
        if(route && route.layer && route.query) {
            console.log("Finding : "+route.layer+", "+route.query);

            var wfs = new OpenLayers.Protocol.HTTP({
                url:WMSCONFIG.wfs_server_path+"?service=wfs&version=1.0&request=GetFeature&typename=" + route.layer,
                format: new OpenLayers.Format.GML.v3({})
            });

            // start spinner
            Maps.set("isLoading", YES);

            wfs.read({
                params:{
                    "CQL_FILTER":route.query
                },
                callback: Maps.MainResponder.didFetchWfsFeatures
            });
        }
    },

    progressPane: null,

    updateStateProgress:function (progress) {
        if (this.progressPane) {
            var currentStates = Maps.statechart.currentStates();
            currentStates.every(
                function(it) {
                    if(it && it.updateProgress) {
                        it.updateProgress(progress);
                    }
                }
            );
        }
    },

    isGEOSERVER: null,
    isMAPSERVER: null

});

