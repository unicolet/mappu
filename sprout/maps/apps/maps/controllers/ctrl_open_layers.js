/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

/*globals Maps */

/** @class

    (Document Your Controller Here)

 @extends SC.Object
 */

sc_require("resources/OpenLayers");

Maps.openLayersController = SC.ArrayController.create(
    SC.CollectionViewDelegate,
    /** @scope Maps.openLayersController.prototype */ {

        // only used in loadingWms to save the layer list
        // which is the moved to content so that the view can pickup the changes
        tmp: null,

        measure: '',

        destroyOpenLayersMap: function() {
            var olmap = this.getOLMAP();
            if (olmap) {
                olmap.destroy();
                Maps.mainPage.get("openLayersView").set("olmap", null);
            }
        },

        getOLMAP: function() {
            return Maps.mainPage.get("openLayersView").get("olmap");
        },

        getOLView: function() {
            return Maps.mainPage.get("openLayersView");
        },

        getFeatureInfoLayer: function() {
            var olview = this.getOLView();
            if (!olview.get("FEATURE_INFO_LAYER"))
                olview.addUtilityLayers(this.getOLMAP());
            return olview.get("FEATURE_INFO_LAYER");
        },

        getMarkersLayer: function() {
            var olview = this.getOLView();
            if (!olview.get("MARKERS_LAYER"))
                olview.addUtilityLayers(this.getOLMAP());
            return olview.get("MARKERS_LAYER");
        },

        getGeotoolsLayer: function() {
            var olview = this.getOLView();
            if (!olview.get("GEOTOOLS_LAYER"))
                olview.addUtilityLayers(this.getOLMAP());
            return olview.get("GEOTOOLS_LAYER");
        },

        clearGeoToolsSelection: function() {
            Maps.featureInfoController.set("feature1", null);
            Maps.featureInfoController.set("feature2", null);
            Maps.featureInfoController.set("feature1geom", null);
            Maps.featureInfoController.set("feature2geom", null);
        },

        handleZOrderingChange: function(event) {
            if (event && event.property == "order") {
                var l = event.layer;
                var map = l.map;
                var order = map.getLayerIndex(l);
                if (
                    l instanceof OpenLayers.Layer.WMS
                        &&
                        order >= (map.layers.length - 3) // keep three vector layers on top
                    ) {
                    map.setLayerIndex(l, order - 1);
                }
            }
        },

        handleMoveEnd: function(event) {
            SC.routes.informLocation('location', 'pan/'+event.object.center.lat+'/'+event.object.center.lon+'/'+event.object.zoom);
        },

        // lat lon where the mouse was last ctrl-clicked
        lat:null,
        lon:null,

        menuPane: SC.MenuPane.create({
            layout: {width: 200},
            itemHeight: 22,
            items: [
                { title: '_geocode'.loc(), icon: 'http://maps.gstatic.com/favicon.ico', action: "geocode" },
                { title: '_streetview'.loc(), icon: 'icon-streetview-16', action: "streetview" }
            ],
            /** @private
             The ideal position for a picker pane is just below the anchor that
             triggered it + offset of specific preferType. Find that ideal position,
             then call fitPositionToScreen to get final position. If anchor is missing,
             fallback to center.
             */
            positionPane: function(useAnchorCached) {
                useAnchorCached = useAnchorCached && this.get('anchorCached');

                var anchor = useAnchorCached ? this.get('anchorCached') : this.get('anchorElement'),
                    layout       = this.get('layout');

                if ( anchor && anchor.x && anchor.y ) {
                    this.adjust({ width: layout.width, height: layout.height, left: anchor.x, top: anchor.y });
                    // if no anchor view has been set for some reason, just center.
                } else {
                    this.adjust({ width: layout.width, height: layout.height, centerX: 0, centerY: 0 });
                }
                this.updateLayout();
                return this;
            }
        }),

        layerQuery: function(layer, query) {
            var wfs = new OpenLayers.Protocol.HTTP({
                url:WMSCONFIG.wfs_server_path + "?service=wfs&version=1.0.0&request=GetFeature&typename=" + layer,
                format:new OpenLayers.Format.GML({})
            });

            // start spinner
            Maps.set("isLoading", YES);

            wfs.read({
                params:{
                    "CQL_FILTER": query
                },
                callback: this.loadWFSFeatures
            });
        },

        loadWFSFeatures: function(response) {
            try {
                var gml = new OpenLayers.Format.GML({extractAttributes:true});
                response.features = gml.read(response.priv.responseXML);
                Maps.openLayersController.showInfo(response);
            } catch (e) {
                console.log(e);
                SC.AlertPane.warn("_op_failed".loc(), response.error, '_no_info_avail'.loc(), "OK", this);
            }
        },

        /*
         * This function is called by the OpenLayers featureInfo control.
         * It's a really ugly piece of code because it mixes controller, datasource and view
         * instructions.
         * Until I don't come up with a better solution it has to stay this way though.
         *
         * Transform should almost always be true
         *
         */
        showInfo: function(event) {
            // disable spinner
            Maps.set("isLoading", NO);

            if (event.features && event.features.length) {
                this.set("measure", ""); // clear measure text

                var highlightLayer = this.getFeatureInfoLayer();
                var markersLayer = this.getMarkersLayer();

                // remove all previous marker and hilit features
                while (markersLayer.markers.length > 0) {
                    markersLayer.removeMarker(markersLayer.markers[0]);
                }
                highlightLayer.removeAllFeatures();

                for (var i = 0; i < event.features.length; i++) {
                    var feature = event.features[i];
                    if(feature.geometry!==null) {
                        var c = feature.geometry.getCentroid();
                        //@if(debug)
                        console.log("Centroid before: "+ c.x+","+ c.y);
                        //@endif

                        this.detectServerType(event);
                        if(Maps.isGEOSERVER) {
                            // apply transform to the feature geometry only if we detect geoserver
                            // and the owner layer srs is not EPSG:900913
                            try {
                                var ownerLayer = Maps.openLayersController.get("content").findProperty("name", feature.gml.featureNSPrefix + ':' + feature.gml.featureType);
                                var sourceProjection = WMSCONFIG.default_srs;
                                if (ownerLayer) {
                                    var sourceProjection = ownerLayer.get("srs");
                                }
                                if(sourceProjection) {
                                    var geom=feature.geometry.clone().transform(Maps.projections[sourceProjection], Maps.projections['EPSG:900913']);
                                    feature.wgs84_geometry=geom.transform(Maps.projections['EPSG:900913'], Maps.projections['EPSG:3410']);
                                }
                                if (sourceProjection && sourceProjection != 'EPSG:900913') {
                                    //@if(debug)
                                    console.log("Transforming from "+sourceProjection+" to EPSG:900913");
                                    //@endif
                                    c.transform(Maps.projections[sourceProjection], Maps.projections['EPSG:900913']);
                                    feature.geometry.transform(Maps.projections[sourceProjection], Maps.projections['EPSG:900913']);
                                }
                            } catch(e) {
                                SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + e, "", "OK", this);
                            }
                        }
                        // save the centroid as a feature attibute, we'll need it later
                        feature.data['x'] = c.x;
                        feature.data['y'] = c.y;

                        //@if(debug)
                        console.log("Centroid after: "+ c.x+","+ c.y);
                        //@endif

                        var marker = new OpenLayers.Marker(new OpenLayers.LonLat(c.x, c.y), icon.clone());
                        marker.data = {'feature':feature, 'idx':i};
                        markersLayer.addMarker(marker);
                        marker.events.register(
                            'click',
                            marker,
                            function(e) {
                                Maps.featureInfoController.toggleMarker(e, this, highlightLayer);
                            });
                    }
                }
                markersLayer.redraw();
                SC.RunLoop.begin();
                Maps.MapsDataSource.rawFeatures = event.features;
                Maps.featureInfoController.deselectObjects(Maps.featureInfoController.get("selection"));
                if (!Maps.features) {
                    Maps.features = Maps.store.find(Maps.FEATURE_QUERY);
                    Maps.featureInfoController.set('content', Maps.features);
                } else {
                    Maps.features.refresh();
                }
                SC.RunLoop.end();

            } else {
                this.set("measure", "Nessun risultato");
            }
        },

        detectServerType : function (input) {
            if(Maps.isGEOSERVER==null && Maps.isMAPSERVER==null) {
                Maps.isGEOSERVER=YES;
                Maps.isMAPSERVER=NO;
                // the mapserver guys like to advertise their version in the comments
                if( typeof(input)=="string" && input.search("MapServer")!= -1) {
                    //@if(debug)
                    console.log("check 1 detectServerType: detected MapServer");
                    //@endif
                    Maps.isGEOSERVER=NO;
                    Maps.isMAPSERVER=YES;
                } else if (input.request && input.request.responseText.search("MapServer") != -1) {
                    //@if(debug)
                    console.log("check 2 detectServerType: detected MapServer");
                    //@endif
                    Maps.isGEOSERVER=NO;
                    Maps.isMAPSERVER=YES;
                }
            }
        },

        /* remove all features retrieved by a GetFeatureInfo */
        clearFeatures: function() {
            var highlightLayer = this.getFeatureInfoLayer();
            var markersLayer = this.getMarkersLayer();

            // remove all previous marker and hilit features
            while (markersLayer.markers.length > 0) {
                markersLayer.removeMarker(markersLayer.markers[0]);
            }
            highlightLayer.removeAllFeatures();
            Maps.MapsDataSource.rawFeatures = [];
            if (!Maps.features) {
                Maps.features = Maps.store.find(Maps.FEATURE_QUERY);
                Maps.featureInfoController.set('content', Maps.features);
            } else {
                Maps.features.refresh();
            }
        },

        whichBaseLayer: "Streets",
        switchBaseLayer: function() {
            var map = this.getOLMAP(), layers;
            //@if(debug)
            console.log("Selected new base layer: "+this.get("whichBaseLayer").loc());
            //@endif
            if(MAPPU_BASELAYERS) {
                layers=map.getLayersByName(this.get("whichBaseLayer").loc());
                if(layers || layers.length>0) {
                    map.setBaseLayer(layers[0]);
                }
            } else {
                var newBaseLayer = "Google " + this.get("whichBaseLayer");
                layers=map.getLayersByName(newBaseLayer);
                if(layers || layers.length>0) {
                    map.setBaseLayer(layers[0]);
                }
            }
        }.observes(".whichBaseLayer"),

        // a layer has been selected on the layer list
        onLayerSelected: function() {
            var layer = SC.getPath('Maps.openLayersController.selection.firstObject');
            if (layer) {
                Maps.layerController.set("content", layer);
            }
        },

        // this is bound to the sceneView nowShowing property
        layerSearchNowShowing:null,
        goToEditQuery: function() {
            this.set("layerSearchNowShowing", "Maps.mainPage.queryEditPane");
        },

        goToListQuery: function() {
            this.set("layerSearchNowShowing", "Maps.mainPage.queryListPane");
        },

        //
        legendBtnText: "",
        // this is bound to the sceneView nowShowing property
        layerPaletteNowShowing:null,
        goToDetail: function() {
            this.set("layerPaletteNowShowing", "Maps.mainPage.layerInfoView");
            this.set("legendBtnText","_legend".loc())
        },

        goToLegend: function() {
            this.set("layerPaletteNowShowing", "Maps.mainPage.layerLegendView");
            this.set("legendBtnText","_layerprops".loc())
        },

        /**
         * Specifies that we are allowed to drag teams
         */
        collectionViewDragDataTypes: function(view) {
            return [Maps.Layer];
        },

        /**
         Called by a collection view when a drag concludes to give you the option
         to provide the drag data for the drop.

         This method should be implemented essentially as you would implement the
         dragDataForType() if you were a drag data source.  You will never be asked
         to provide drag data for a reorder event, only for other types of data.

         The default implementation returns null.

         @param view {SC.CollectionView}
         the collection view that initiated the drag

         @param dataType {String} the data type to provide
         @param drag {SC.Drag} the drag object
         @returns {Object} the data object or null if the data could not be provided.
         */
        collectionViewDragDataForType: function(view, drag, dataType) {
            var ret = null;

            if (dataType === Maps.Layer) {
                return view.get('selection');
            }

            return ret;
        },


        /**
         Called by the collection view to actually accept a drop.  This method will
         only be invoked AFTER your validateDrop method has been called to
         determine if you want to even allow the drag operation to go through.

         You should actually make changes to the data model if needed here and
         then return the actual drag operation that was performed.  If you return
         SC.DRAG_NONE and the dragOperation was SC.DRAG_REORDER, then the default
         reorder behavior will be provided by the collection view.

         @param view {SC.CollectionView}
         @param drag {SC.Drag} the current drag object
         @param op {Number} proposed logical OR of allowed drag operations.
         @param proposedInsertionIndex {Number} an index into the content array representing the proposed insertion point.
         @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
         @returns the allowed drag operation.  Defaults to proposedDragOperation
         */
        collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
            // content is just a reference to this object.
            var content = view.get('content');
            var ret = SC.DRAG_NONE;

            // Continue only if data is available from drag
            var selectionSet = drag.dataForType(Maps.Layer);
            if (!selectionSet) {
                return ret;
            }

            // Get our record - there should only be 1 selection
            var record = selectionSet.firstObject();

            // Suspend notifications for bulk changes to properties
            content.beginPropertyChanges();

            // Actual re-ordering
            var oldIndex = record.get('order')-1;  // -1 to convert from ranking # to index
            //@if(debug)
            console.log("reordering item[" + oldIndex + "]=" + record.get('name') + " to " + proposedInsertionIndex);
            //@endif
            if (proposedInsertionIndex > oldIndex) {
                // Move up list
                for (var i = proposedInsertionIndex; i > oldIndex; i--) {
                    //@if(debug)
                    console.log("[UP] Moving item[" + i + "]=" + this.objectAt(i).get('name') + " up to " + i);
                    //@endif
                    this.objectAt(i).set('order', i);  // add 1 to convert from ranking to sequence #
                }
            } else {
                // Move down list
                for (var i = oldIndex - 1; i >= proposedInsertionIndex; i--) {
                    //@if(debug)
                    console.log("[DOWN] Moving item[" + i + "]=" + this.objectAt(i).get('name') + " down to " + (i+2));
                    //@endif
                    this.objectAt(i).set('order', (i+2));  // add 1 to convert from ranking to sequence #
                }
            }
            //@if(debug)
            console.log("[LAST] Moving item[" + oldIndex + "] to " + proposedInsertionIndex);
            //@endif
            record.set('order', proposedInsertionIndex + 1);

            // Restart notifications
            content.endPropertyChanges();

            // Return the requested op, usually SC.DRAG_REORDER, to flag that the event has been handled
            return op;
        }
    });
