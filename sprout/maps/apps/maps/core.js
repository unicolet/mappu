// ==========================================================================
// Project:   Maps
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

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

        // TODO: Add global constants or singleton objects needed by your app here.
        first_time:YES,

        print: function() {
            Maps_print();
        },

        gaussBoagaProj: null,
        googleProj: null,
        
        initProjections: function() {
            // add decent error reporting into proj4js
            Proj4js.reportError=function(msg){console.log(msg);};

            Maps.gaussBoagaProj = new OpenLayers.Projection('EPSG:3003');
            Maps.googleProj = new OpenLayers.Projection('EPSG:900913');
        }

    });

