// ==========================================================================
// Project:   Maps.OpenLayers
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
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

        // here we only init the openlayers object. Actual rendering has been moved
        // to a function observing the layer member (see below renderOpenLayersMap)
        didAppendToDocument: function() {
            console.log("didAppendToDocument - Initializing OL");
            this.initOpenLayers();
        },

        renderOpenLayersMap: function() {
            var layer = this.get("layer"),
                map   = this.get("olmap");
            if (layer && map) map.render(layer);
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
            map.Z_INDEX_BASE = { BaseLayer: 0, Overlay: 5, Feature: 10, Popup: 15, Control: 20 };

            this.addGoogleLayers(map);
            this.addUtilityLayers(map);
            this.addControls(map);

            map.setCenter(new OpenLayers.LonLat(1325724, 5694253), 12);
            // some brutal z-index hacking
            map.layerContainerDiv.style.zIndex = map.Z_INDEX_BASE['Popup'] - 1;
            // render to the specified HTML Element
            // deferred
            //map.render('olmap');
            // touch support for openlayers
            // does not work well, so I'll disable it for now
            //var touchHandler=new TouchHandler( map, 4 );
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
                infoControls[i].events.register("getfeatureinfo", this, Maps.openLayersController.showInfo);
                map.addControl(infoControls[i]);
            }

            //map.addControl(new OpenLayers.Control.LayerSwitcher());
            infoControls.click.activate();
            // end get geature info section
        },

        addUtilityLayers: function(map) {
            /* this layer is use to highlight currently selected features */
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

    displayProperties: ["content", "content.visible"],

    render: function(context, firstTime) {
        this.createOrUpdateWMSLayer();
        return context;
    },

    updateLayer: function(context) {
        this.createOrUpdateWMSLayer();
    },

    createOrUpdateWMSLayer: function() {
        var map   = this.parentView.get("olmap");
        var layer = this.get("content");
        var wmsLayerWithName = map.getLayersByName(layer.get("name"));
        var wms = (wmsLayerWithName.length ? wmsLayerWithName[0] : null);
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
                    'opacity': 0.7,
                    'visibility': layer.get('visible'),
                    'isBaseLayer': false,
                    'wrapDateLine': true
                }
            );
            map.addLayer(wms);
        } else {
            wms.setVisibility(layer.get('visible'));
            map.setLayerIndex(wms, layer.get("order")-1);
        }
    }
});