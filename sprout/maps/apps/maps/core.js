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
    VERSION: '1.1',

    RIGHT_TOOL_BOX_PANE_ZINDEX: 100,

    // This is your application store.  You will use this store to access all
    // of your model data.  You can also set a data source on this store to
    // connect to a backend server.  The default setup below connects the store
    // to any fixtures you define.
    wmsStore: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.LayerDataSource'),
    store: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.MapsDataSource'),

    isLoading: NO,
    bbox: null,

    projections: {},

    initProjections: function() {
        // add decent error reporting into proj4js
        Proj4js.reportError=function(msg){console.log(msg);};

        Maps.projections['EPSG:3003'] = new OpenLayers.Projection('EPSG:3003');
        Maps.projections['EPSG:900913'] = new OpenLayers.Projection('EPSG:900913');
        Maps.projections['EPSG:4326'] = new OpenLayers.Projection('EPSG:4326');
        Maps.projections['EPSG:3410'] = new OpenLayers.Projection('EPSG:3410');
    },

    /**
     * This controls whether the app, when teh capabilities have been read, should zoom
     * to the capabilites extent. Can be overridden by the zoom route, below.
     */
    shouldZoom: YES,

    /**
     * Handle routing notificartons
     */
    zoomRoute: function(route) {
        this.invokeLast(function(){
            if(route && route.lat && route.lon) {
                //@if(debug)
                console.log("Zoooming to: "+route.lat+","+route.lon+" level="+route.level);
                //@endif
                var center=new OpenLayers.LonLat(route.lon, route.lat).transform(Maps.projections['EPSG:4326'], Maps.projections['EPSG:900913']);
                Maps.openLayersController.getOLMAP().setCenter(center, (route.level?route.level:15) );
                Maps.set("shouldZoom",NO);
            }
        });
    },

    panRoute: function(route) {
        this.invokeLast(function(){
            if(route && route.lat && route.lon) {
                //@if(debug)
                console.log("Zoooming to: "+route.lat+","+route.lon+" level="+route.level);
                //@endif
                var center=new OpenLayers.LonLat(route.lon, route.lat);
                Maps.openLayersController.getOLMAP().setCenter(center, (route.level?route.level:15) );
                Maps.set("shouldZoom",NO);
            }
        });
    },

    findRoute: function(route) {
        this.invokeLast(function(){
            if(route && route.layer && route.query) {
                //@if(debug)
                console.log("Finding : "+route.layer+", "+route.query);
                //@endif
                Maps.openLayersController.layerQuery(route.layer,route.query);
            }
        });
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

    /*
        The application will try to detect which server it's talking to by looking  at the capabilities
        and/or GetFeatureInfo response.
     */
    isGEOSERVER: null,
    isMAPSERVER: null,

    /* Utility functions */
    formatArea: function(area) {
        var unit="m";
        var a=Math.round(area);
        if(area) {
            if(area>1000000) {
                a=(area/1000000).toFixed(2);
                unit="km";
            }
        }
        return a + " " + unit +"<sup>2</sup>";
    },

    createLayer: function(options){
        var theConstructor=SC.getPath(window, options.provider)
            layer=null;
        // following constructor code from: http://stackoverflow.com/a/1608546/887883
        // now invoke it
        function F() {
            return theConstructor.apply(this, options.args);
        }
        F.prototype = theConstructor.prototype;
        layer = new F();
        layer.name=options.name.loc();
        //@if(debug)
        console.log("Created layer: "+options.name.loc());
        //@endif
        return layer;
    }
});

