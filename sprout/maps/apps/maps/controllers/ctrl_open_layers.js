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

Maps.openLayersController = SC.ArrayController.create(
    SC.CollectionViewDelegate,
    /** @scope Maps.openLayersController.prototype */ {

        measure: '',

        destroyOpenLayersMap: function() {
            var olmap=this.getOLMAP();
            if(olmap) {
                olmap.destroy();
                Maps.mainPage.mainPane.splitview.topLeftView.set("olmap",null);
            }
        },

        getOLMAP: function() {
            return Maps.mainPage.mainPane.splitview.topLeftView.get("olmap");
        },

        getOLView: function() {
            return Maps.mainPage.mainPane.splitview.topLeftView;
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

        tools: "toolMove".w(),
        toolsDidChange : function() {
            var tool = this.get("tools");

            if (tool == 'toolMove') {
                this.getOLView().toolMove();
                // clear last measure
                Maps.openLayersController.set('measure', '');
            }
            if (tool == 'toolArea') {
                this.getOLView().toolArea();
            }
            if (tool == 'toolLength') {
                this.getOLView().toolLength();
            }
            if (tool == 'toggleLayers') {
                this.toggleLayers();
            }
            if (tool == 'toolGeo') {
                this.clearGeoToolsSelection();
                // reset
                if (!Maps.mainPage.geotools.isVisibleInWindow) {
                    // make invisible w/o animation
                    Maps.mainPage.geotools.adjust("opacity", 0).updateStyle();
                    // append
                    Maps.mainPage.geotools.append();
                    // animate appearance
                    Maps.mainPage.geotools.adjust("opacity", 1);
                }
                this.set("tools", "toolMove");
            }
        }.observes(".tools"),

        clearGeoToolsSelection: function() {
            Maps.featureInfoController.set("feature1", null);
            Maps.featureInfoController.set("feature2", null);
            Maps.featureInfoController.set("feature1geom", null);
            Maps.featureInfoController.set("feature2geom", null);
        },

        /*
        * This function is called by the OpenLayers featureInfo control.
        * It's a really ugly piece of code because it mixes controller, datasource and view
        * instructions.
        * Until I don't come up with a better solution it has to stay this way though.
        * 
        */
        showInfo: function(event) {
            // disable spinner
            Maps.set("isLoading",NO);
            
            if (event.features && event.features.length) {
                this.set("measure","");

                var highlightLayer = this.getFeatureInfoLayer();
                var markersLayer = this.getMarkersLayer();

                // remove all previous marker and hilit features
                while (markersLayer.markers.length > 0) {
                    markersLayer.removeMarker(markersLayer.markers[0]);
                }
                highlightLayer.removeAllFeatures();

                for (var i = 0; i < event.features.length; i++) {
                    var feature = event.features[i];
                    var c = feature.geometry.getCentroid();

                    // apply transform if required
                    try {
                        var sourceProjection=Maps.openLayersController.get("content").findProperty("name",feature.gml.featureNSPrefix + ':' + feature.gml.featureType).get("srs");
                        if(sourceProjection && sourceProjection!='EPSG:900913') {
                            c.transform(Maps.projections[sourceProjection], Maps.projections['EPSG:900913']);
                            feature.geometry.transform(Maps.projections[sourceProjection], Maps.projections['EPSG:900913']);
                        }
                    } catch(e) {
                        alert("Errore leggendo i risulati: "+e);
                    }

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
                markersLayer.redraw();
                SC.RunLoop.begin();
                Maps.MapsDataSource.rawFeatures = event.features;
                if (!Maps.features) {
                    Maps.features = Maps.store.find(Maps.FEATURE_QUERY);
                    Maps.featureInfoController.set('content', Maps.features);
                } else {
                    Maps.features.refresh();
                }
                SC.RunLoop.end();

            } else {
                this.set("measure","Nessun risultato");
            }
        },

        whichGoogleLayer: "Streets",
        switchGoogleLayer: function() {
            var newBaseLayer = "Google " + this.get("whichGoogleLayer");
            var map = this.getOLMAP();
            map.setBaseLayer(map.getLayersByName(newBaseLayer)[0]);
        }.observes(".whichGoogleLayer"),

        // layersAndSearch is bound to the Layers/Search combo buttons on the toolbar
        layersAndSearch: null,
        toggleLayers: function() {
            var selected = this.get("layersAndSearch");

            // make selected always an array
            if (! $.isArray(selected)) {
                selected = (selected + "").w();
            }

            if (selected.find(function(i, j, l) {
                return i == "LAYERS"
            })) {
                // prepare animation
                Maps.mainPage.layerPalette.disableAnimation();
                Maps.mainPage.layerPalette.adjust("opacity", 0).updateStyle();
                // append
                Maps.mainPage.layerPalette.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
                Maps.mainPage.layerPalette.enableAnimation();
                // perform animation
                Maps.mainPage.layerPalette.adjust("opacity", 1);
            } else {
                // can't animate pp removal, sob
                Maps.mainPage.layerPalette.remove();
            }
            if (selected.find(function(i, j, l) {
                return i == "SEARCH"
            })) {
                // prepare animation
                Maps.mainPage.layerSearchPane.disableAnimation();
                Maps.mainPage.layerSearchPane.adjust("opacity", 0).updateStyle();
                // append
                Maps.mainPage.layerSearchPane.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
                Maps.mainPage.layerSearchPane.enableAnimation();
                // perform animation
                Maps.mainPage.layerSearchPane.adjust("opacity", 1);
                this.goToListQuery();
            } else {
                Maps.mainPage.layerSearchPane.remove();
            }
        }.observes(".layersAndSearch"),

        /*
         Keep button state and panel visibility in sync
         */
        didPickerPaneRemove: function() {
            if (( !Maps.mainPage.layerSearchPane.get("isVisibleInWindow") )
                &&
                ( !Maps.mainPage.layerPalette.get("isVisibleInWindow") )
                ) {
                this.set("layersAndSearch", "".w());
            }
        }.observes("Maps.mainPage.layerSearchPane.isVisibleInWindow", "Maps.mainPage.layerPalette.isVisibleInWindow"),


        // a layer has been selected on the layer list
        onLayerSelected: function() {
            var layer = SC.getPath('Maps.openLayersController.selection.firstObject');
            if(layer) {
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
            var oldIndex = record.get('order');  // -1 to convert from ranking # to index
            console.log("reordering: from "+oldIndex+" to "+proposedInsertionIndex);
            if (proposedInsertionIndex < oldIndex) {
                // Move up list
                for (var i = proposedInsertionIndex; i < oldIndex; i++) {
                    this.objectAt(i).set('order', i+1);  // add 1 to convert from ranking to sequence #
                }
            } else {
                // Move down list
                for (var i = oldIndex; i < proposedInsertionIndex; i++) {
                    this.objectAt(i).set('order', i-1);  // add 1 to convert from ranking to sequence #
                }
            }
            record.set('order', proposedInsertionIndex);

            // Restart notifications
            content.endPropertyChanges();

            // Return the requested op, usually SC.DRAG_REORDER, to flag that the event has been handled
            return op;
        }
    });
