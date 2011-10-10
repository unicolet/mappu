/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/*globals Maps */

/** @class

    (Document Your View Here)

 @extends SC.View
 */


var size = new OpenLayers.Size(21, 25);
var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
var iconSelected = new OpenLayers.Icon(sc_static('/images/pin_selected.png'), size, offset);
var icon = new OpenLayers.Icon(sc_static('/images/pin.png'), size, offset);
var currentMarker = null;

Maps.OpenLayers = SC.CollectionView.extend(
    /** @scope Maps.OpenLayers.prototype */ {

        // utility properties
        measureControls: null,
        FEATURE_INFO_LAYER:null,
        GEOTOOLS_LAYER:null,
        MARKERS_LAYER:null,
        FEATURE_INFO_LAYER_NAME:"_FEATURE_INFO",
        GEOTOOLS_LAYER_NAME:"_GEOTOOLS",
        MARKERS_LAYER_NAME:"_MARKERS",
        olmap: null,

        render: function(context) {
            return context;
        },
        update: function(jquery) {
            return jquery;
        },

        renderOpenLayersMap: function() {
            var layer = this.get("layer"),
                map   = this.get("olmap");
            if (layer && map) {
                ///console.log("OL renderOpenLayersMap::render");
                map.render(layer);
            } else if(!map && layer) {
                //console.log("OL renderOpenLayersMap::init");
                this.initOpenLayers();
            }
        }.observes("layer"),

        initOpenLayers: function() {
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
            var map = new OpenLayers.Map(options);

            this.addGoogleLayers(map);
            /*
             * Utility layers will be lazy-added at first use, see
             * Maps.openLayersController.getFeatureInfoLayer
             *
             * This to both reduce startup time and ensure that they
             * are added at the bottom of the layer list.
             *
             * */
            //this.addUtilityLayers(map);
            this.addControls(map);

            map.setCenter(new OpenLayers.LonLat(1325724, 5694253), 12);
            this.set('olmap', map);
        },

        addGoogleLayers: function(map) {
            // create Google Mercator layers
            var googleStreets = new OpenLayers.Layer.Google(
                "Google Streets",
                {'sphericalMercator': true}
            );
            var googleHybrid = new OpenLayers.Layer.Google(
                "Google Satellite",
                {'type': google.maps.MapTypeId.SATELLITE, 'sphericalMercator': true}
            );

            map.addLayer(googleStreets);
            map.addLayer(googleHybrid);
        },


        addControls: function(map) {
            map.addControl(new OpenLayers.Control.MousePosition());

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

            var measureControls = {
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
            var featureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                    url: '/geoserver/wms',
                    // make featureinfo requests work even with geo web cache
                    layerUrls: ["/geoserver/gwc/service/wms"],
                    title: 'Identify features by clicking',
                    layers: null, // use null for ALL layers
                    queryVisible: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    srs: 'EPSG:900913'
                });
            featureInfoControl.events.register("getfeatureinfo", Maps.openLayersController, Maps.openLayersController.showInfo);
            map.addControl(featureInfoControl);

            featureInfoControl.activate();
            // end get geature info section
        },

        addUtilityLayers: function(map) {
            /* this layer is used to highlight currently selected features */
            var featureInfoLayer = new OpenLayers.Layer.Vector(this.FEATURE_INFO_LAYER_NAME, {
                displayInLayerSwitcher: false,
                isBaseLayer: false,
                visibility: true
            });
            map.addLayer(featureInfoLayer);
            this.set('FEATURE_INFO_LAYER', featureInfoLayer);

            /* this layer is used to display intersection/union/etc results */
            var geoStyleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
                {fillColor: "green", fillOpacity: 0.7, strokeColor: "black"},
                OpenLayers.Feature.Vector.style["default"]));
            var geoToolsLayer = new OpenLayers.Layer.Vector(this.GEOTOOLS_LAYER_NAME, {
                displayInLayerSwitcher: false,
                isBaseLayer: false,
                visibility: true,
                styleMap:geoStyleMap});
            map.addLayer(geoToolsLayer);
            this.set('GEOTOOLS_LAYER', geoToolsLayer);

            /* this is used to display pins */
            var markers = new OpenLayers.Layer.Markers(this.MARKERS_LAYER_NAME);
            map.addLayer(markers);
            this.set("MARKERS_LAYER", markers);
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
        }
    });

Maps.OpenLayersLayer = SC.View.extend({
    isReusableInCollections: YES,

    content: null,

    displayProperties: ["content", "content.visible", "content.opacity", "content.cql_filter"],

    render: function(context, firstTime) {
        this.createOrUpdateWMSLayer();
        return context;
    },

    updateLayer: function(context) {
        this.createOrUpdateWMSLayer();
    },

    wmsLayersCache: [],

    createOrUpdateWMSLayer: function() {
        var map   = this.parentView.get("olmap");
        var layer = this.get("content");
        //var wmsLayerWithName = map.getLayersByName(layer.get("name"));
        //var wms = (wmsLayerWithName.length ? wmsLayerWithName[0] : null);
        var wms = this.wmsLayersCache[layer.get("name")];
        if(layer.get('visible')) {
            if (!wms) {
                // now build the WMS layer
                wms = new OpenLayers.Layer.WMS(
                    layer.get('name'),
                    "/geoserver/gwc/service/wms",
                    {
                        layers: layer.get('name'),
                        'transparent':'true'
                    },
                    {
                        'opacity': layer.get('opacity')/10,
                        'visibility': layer.get('visible'),
                        'isBaseLayer': false,
                        //'wrapDateLine': true,
                        'buffer': 0,
                        'tileSize': new OpenLayers.Size(512, 512),
                        'maxExtent': layer.get('maxExtent'),
                        'minExtent': new OpenLayers.Bounds(-1, -1, 1, 1)
                    }
                );
                // add to the map, the set index to preserve ordering
                map.addLayer(wms);
                map.setLayerIndex(wms, layer.get("order")-1);
                // save it into the cache
                this.wmsLayersCache[layer.get("name")]=wms;
            } else {
                wms.setVisibility(layer.get('visible'));
                wms.setOpacity(layer.get('opacity')/10);

                if(layer.get("cql_filter")!=null) {
                    wms.mergeNewParams({"cql_filter": layer.get("cql_filter")});
                    wms.url="/geoserver/wms";
                } else {
                    wms.mergeNewParams({"cql_filter": null});
                    wms.url="/geoserver/gwc/service/wms";
                }
                // if removed, re-add it
                if(map.getLayersByName(layer.get("name")).length==0) {
                    map.addLayer(wms);
                }
                map.setLayerIndex(wms, layer.get("order")-1);
                wms.redraw();
            }
        } else {
            // if on the map, remove layer from map
            if(map.getLayersByName(layer.get("name")).length>0) {
                map.removeLayer(wms);
            }
        }
    }
});