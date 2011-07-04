// ==========================================================================
// Project:   Maps.openLayersController
// Copyright: �2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

    (Document Your Controller Here)

 @extends SC.Object
 */

Maps.openLayersController = SC.ArrayController.create(
    SC.CollectionViewDelegate,
    /** @scope Maps.openLayersController.prototype */ {

        olmap : null,
        wms : null,
        measureControls: null,
        measure: '',
        FEATURE_INFO_LAYER:null,
        GEOTOOLS_LAYER:null,
        MARKERS_LAYER:null,
        geotools: null,

        tools: "toolMove".w(),
        toolsDidChange : function() {
            var tool = this.get("tools");

            if (tool == 'toolMove') {
                this.toolMove();
                // clear last measure
                Maps.openLayersController.set('measure', '');
            }
            if (tool == 'toolArea') {
                this.toolArea();
            }
            if (tool == 'toolLength') {
                this.toolLength();
            }
            if (tool == 'toggleLayers') {
                this.toggleLayers();
            }
            if (tool == 'toolGeo') {
                this.clearGeoToolsSelection();
                // reset
                if (!Maps.mainPage.geotools.isVisibleInWindow) {
                    Maps.mainPage.geotools.append();
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

        toolMove : function() {
            var measureControls = this.get('measureControls');
            for (var key in measureControls) {
                var control = measureControls[key];
                if ('none' == key) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
            return "Move";
        },

        toolArea : function() {
            var measureControls = this.get('measureControls');
            for (var key in measureControls) {
                var control = measureControls[key];
                if ('polygon' == key) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
            return "Area";
        },

        toolLength : function() {
            var measureControls = this.get('measureControls');
            for (var key in measureControls) {
                var control = measureControls[key];
                if ('line' == key) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
            return "Length";
        },

        toggleLayer: function(layer, status) {
            var olLayer = this.get('olmap').getLayersByName(layer)[0];
            olLayer.setVisibility(status);
        },

        installOpenLayersControl: function() {
            if (this.get("content").status == SC.Record.READY_CLEAN) {
                var options = {
                    tileSize: new OpenLayers.Size(256, 256),
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    displayProjection: new OpenLayers.Projection("EPSG:4326"),
                    units: "m",
                    numZoomLevels: 18,
                    maxResolution: 156543.0339,
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                        20037508, 20037508.34)
                };

                // create Google Mercator layers
                var googleStreets = new OpenLayers.Layer.Google(
                    "Google Streets",
                    {'sphericalMercator': true}
                );
                var googleHybrid = new OpenLayers.Layer.Google(
                    "Google Satellite",
                    {'type': google.maps.MapTypeId.SATELLITE, 'sphericalMercator': true}
                );

                var map = new OpenLayers.Map(options);
                map.Z_INDEX_BASE = { BaseLayer: 0, Overlay: 5, Feature: 10, Popup: 15, Control: 20 };
                //map.addControl(new OpenLayers.Control.LayerSwitcher());
                map.addControl(new OpenLayers.Control.MousePosition());
                map.addLayer(googleStreets);
                map.addLayer(googleHybrid);

                var layerList = this.get("content");
                var layerGroups = new Object();
                layerList.forEach(function(item, i, e) {
                    var wms = new OpenLayers.Layer.WMS(
                        item.get('name'),
                        "/geoserver/gwc/service/wms",
                        {
                            layers: item.get('name'),
                            'transparent':'true'
                        },
                        {
                            'opacity': 0.7,
                            visibility: item.get('isVisible'),
                            'isBaseLayer': false,
                            'wrapDateLine': true
                        }
                    );
                    map.addLayer(wms);
                });

                var featureInfoLayer = new OpenLayers.Layer.Vector("Feature Info Layer", {
                    displayInLayerSwitcher: false,
                    isBaseLayer: false,
                    visibility: true
                });
                map.addLayer(featureInfoLayer);
                this.set('FEATURE_INFO_LAYER', featureInfoLayer);

                var geoStyleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
                    {fillColor: "green", fillOpacity: 0.7, strokeColor: "black"},
                    OpenLayers.Feature.Vector.style["default"]));
                var geoToolsLayer = new OpenLayers.Layer.Vector("Geo Tools Layer", {
                    displayInLayerSwitcher: false,
                    isBaseLayer: false,
                    visibility: true,
                    styleMap:geoStyleMap});
                map.addLayer(geoToolsLayer);
                this.set('GEOTOOLS_LAYER', geoToolsLayer);
                var markers = new OpenLayers.Layer.Markers("Markers");
                map.addLayer(markers);
                this.set('MARKERS_LAYER', markers);

                // style the sketch fancy
                var sketchSymbolizers = {
                    "Point": {
                        pointRadius: 4,
                        graphicName: "square",
                        fillColor: "white",
                        fillOpacity: 1,
                        strokeWidth: 1,
                        strokeOpacity: 1,
                        strokeColor: "#333333"
                    },
                    "Line": {
                        strokeWidth: 3,
                        strokeOpacity: 1,
                        strokeColor: "#666666",
                        strokeDashstyle: "dash"
                    },
                    "Polygon": {
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        strokeColor: "#666666",
                        fillColor: "white",
                        fillOpacity: 0.3
                    }
                };
                var style = new OpenLayers.Style();
                style.addRules([
                    new OpenLayers.Rule({symbolizer: sketchSymbolizers})
                ]);
                var styleMap = new OpenLayers.StyleMap({"default": style});

                measureControls = {
                    line: new OpenLayers.Control.Measure(
                        OpenLayers.Handler.Path, {
                            persist: true,
                            handlerOptions: {
                                layerOptions: {styleMap: styleMap}
                            }
                        }
                    ),
                    polygon: new OpenLayers.Control.Measure(
                        OpenLayers.Handler.Polygon, {
                            persist: true,
                            handlerOptions: {
                                layerOptions: {styleMap: styleMap}
                            }
                        }
                    )
                };

                var control;
                for (var key in measureControls) {
                    control = measureControls[key];
                    control.events.on({
                        "measure": this.handleMeasurements,
                        "measurepartial": this.handleMeasurements
                    });
                    map.addControl(control);
                }
                this.set('measureControls', measureControls);

                // get geature info handlers
                var infoControls = {
                    click: new OpenLayers.Control.WMSGetFeatureInfo({
                        url: '/geoserver/wms',
                        // make featureinfo requests work even with geo web cache
                        layerUrls: ["/geoserver/gwc/service/wms"],
                        title: 'Identify features by clicking',
                        layers: null, // use null for ALL layers
                        queryVisible: true,
                        infoFormat: 'application/vnd.ogc.gml',
                        srs: 'EPSG:900913'
                    })};
                for (var i in infoControls) {
                    infoControls[i].events.register("getfeatureinfo", this, this.showInfo);
                    map.addControl(infoControls[i]);
                }

                //map.addControl(new OpenLayers.Control.LayerSwitcher());
                infoControls.click.activate();
                // end get geature info section

                map.setCenter(new OpenLayers.LonLat(1325724, 5694253), 12);
                // some brutal z-index hacking
                map.layerContainerDiv.style.zIndex = map.Z_INDEX_BASE['Popup'] - 1;
                // render to the specified HTML Element
                map.render('olmap');
                // touch support for openlayers
                // does not work well, so I'll disable it for now
                //var touchHandler=new TouchHandler( map, 4 );
                this.set('olmap', map);
            }
        }.observes("*content.status"),

        showInfo: function(event) {
            if (event.features && event.features.length) {
                var gaussBoagaProj = new OpenLayers.Projection('EPSG:3003');
                var googleProj = new OpenLayers.Projection('EPSG:900913');

                var highlightLayer = this.get('FEATURE_INFO_LAYER');
                var markersLayer = this.get('MARKERS_LAYER');

                // remove all previous marker and hilit features
                while (markersLayer.markers.length > 0) {
                    markersLayer.removeMarker(markersLayer.markers[0]);
                }
                highlightLayer.removeAllFeatures();

                for (var i = 0; i < event.features.length; i++) {
                    var feature = event.features[i];
                    var c = feature.geometry.getCentroid().transform(gaussBoagaProj, googleProj);
                    var marker = new OpenLayers.Marker(new OpenLayers.LonLat(c.x, c.y), icon.clone());
                    feature.geometry = feature.geometry.transform(gaussBoagaProj, googleProj);
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
                Maps.FeatureDataSource.rawFeatures = event.features;
                if (!Maps.features) {
                    Maps.features = Maps.featuresStore.find(Maps.FEATURE_QUERY);
                    Maps.featureInfoController.set('content', Maps.features);
                } else {
                    Maps.features.refresh();
                }
                if (Maps.first_time == YES) {
                    Maps.mainPage.mainPane.toolbar.layers.set("value", "RESULTS");
                    Maps.first_time = NO;
                }
                SC.RunLoop.end();
            } else {
                console.log("No features returned by get feature info");
            }
        },

        handleMeasurements: function(event) {
            var geometry = event.geometry;
            var units = event.units;
            var order = event.order;
            var measure = event.measure;
            var out = "";
            if (order == 1) {
                out += "Length: " + measure.toFixed(3) + " " + units;
            } else {
                out += "Area: " + measure.toFixed(3) + " " + units + "<sup>2</sup>";
            }

            Maps.openLayersController.set('measure', out);
        },

        whichGoogleLayer: "Streets",
        switchGoogleLayer: function() {
            var newBaseLayer = "Google " + this.get("whichGoogleLayer");
            var map = this.get("olmap");
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
                Maps.mainPage.layerPalette.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
            } else {
                Maps.mainPage.layerPalette.remove();
            }
            if (selected.find(function(i, j, l) {
                return i == "SEARCH"
            })) {
                Maps.mainPage.layerSearchPane.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
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

            var map = this.get("olmap")

            // Actual re-ordering
            var oldIndex = record.get('order') - 1;  // -1 to convert from ranking # to index
            if (proposedInsertionIndex < oldIndex) {
                // Move up list
                for (var i = proposedInsertionIndex; i < oldIndex; i++) {
                    this.objectAt(i).set('order', i + 1 + 1);  // add 1 to convert from ranking to sequence #
                    // update map layers accordingly

                    map.setLayerIndex(map.getLayersByName(this.objectAt(i).get('name'))[0], i + 1);
                }
            } else {
                // Move down list
                for (var i = oldIndex + 1; i <= proposedInsertionIndex; i++) {
                    this.objectAt(i).set('order', i - 1 + 1);  // add 1 to convert from ranking to sequence #

                    map.setLayerIndex(map.getLayersByName(this.objectAt(i).get('name'))[0], i - 1);
                }
            }
            record.set('order', proposedInsertionIndex + 1);
            map.setLayerIndex(map.getLayersByName(record.get('name'))[0], proposedInsertionIndex);

            // Restart notifications
            content.endPropertyChanges();

            // Return the requested op, usually SC.DRAG_REORDER, to flag that the event has been handled
            return op;
        }
    });
