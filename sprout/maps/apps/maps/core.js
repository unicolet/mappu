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
        }

    });

