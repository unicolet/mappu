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

sc_require("resources/OpenLayers");
sc_require("resources/openlayers_extensions/MappuClickHandler")

var size = new OpenLayers.Size(21, 25);
var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
var iconSelected = new OpenLayers.Icon(sc_static('/images/pin_selected.png'), size, offset);
var icon = new OpenLayers.Icon(sc_static('/images/pin.png'), size, offset);
var currentMarker = null;

Maps.OpenLayers = SC.View.extend(
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

        /*
         * since these events will be handled by OL pretend we handled them or we will
         * handle them twice.
         *
         */
        mouseMoved: function(){
            return YES;
        },
        mouseDown: function(){
            return YES;
        },
        mouseUp: function(){
            return YES;
        },

        render: function(c,f) {
            return c;
        },
        update: function(c) {
            return c;
        },

        didContentChange: function() {
            var content=this.get("content");
            var childViews=this.get("childViews");

            for(var i=childViews.length; i < content.length(); i++) {
                // add new childView...
                var layer=Maps.OpenLayersLayer.design({
                    content: content.objectAt(i)
                }).create();
                this.appendChild(layer);
            }
        }.observes(".content.length"),

        didAppendToDocument: function() {
            this.initOpenLayers();
            var layer = this.get("layer"),
                map   = this.get("olmap");

            this.invokeLast(function(){map.render(layer);});
        },

        initOpenLayers: function() {
            OpenLayers.DOTS_PER_INCH = 90.71428571428572;
            var options = {
                tileSize: new OpenLayers.Size(256, 256),
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                numZoomLevels: 21,
                maxResolution: 78271.516953125,
                //resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4],
                maxExtent: new OpenLayers.Bounds(-20037508, -20037508,20037508, 20037508.34),
                units: 'm',
                fallThrough: false
                //,fractionalZoom: true // required for zoomToScale to work precisely
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

            map.events.register("changelayer",Maps.openLayersController, Maps.openLayersController.handleZOrderingChange);

            map.setCenter(new OpenLayers.LonLat(1325724, 5694253), 12);
            this.set('olmap', map);
        },

        bboxDidChange: function() {
            if(Maps.get("bbox") && this.get("olmap")) {
                // sometimes we shouldn't zoom because the user has routed us to a certain location
                if (Maps.get("shouldZoom")==YES)
                    this.get("olmap").zoomToExtent(Maps.get("bbox"));
            }
        }.observes("Maps.bbox"),

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
            map.addControl(new OpenLayers.Control.Scale());

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
                        geodesic: true,
                        handlerOptions: {
                            layerOptions: {styleMap: styleMap}
                        }
                    }
                ),
                polygon: new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Polygon, {
                        persist: true,
                        geodesic: true,
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
                    url: WMSCONFIG.server_path,
                    // make featureinfo requests work even with geo web cache
                    layerUrls: [WMSCONFIG.server_cache_path],
                    title: 'Identify features by clicking',
                    layers: null, // use null for ALL layers
                    queryVisible: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    srs: 'EPSG:900913'
                });
            featureInfoControl.events.register("getfeatureinfo", Maps.openLayersController, Maps.openLayersController.showInfo);
            featureInfoControl.events.register("beforegetfeatureinfo", Maps.openLayersController, function(){Maps.set("isLoading",YES);});
            map.addControl(featureInfoControl);

            featureInfoControl.activate();
            // end get geature info section

            // click control for geocoding and street view
            var clickControl = new OpenLayers.Control.ModClick(
                {
                    onClick: function(evt){
                        // check that CTRL is pressed while clicking
                        if(evt.ctrlKey) {
                            var map=Maps.openLayersController.getOLMAP();
                            var ll=map.getLonLatFromPixel(new OpenLayers.Pixel(evt.x, evt.y))
                                .transform(Maps.projections['EPSG:900913'], Maps.projections['EPSG:4326'])
                            Maps.openLayersController.set("lat",ll.lat);
                            Maps.openLayersController.set("lon",ll.lon);
                            Maps.openLayersController.menuPane.popup({x:evt.x, y:evt.y});
                        }
                    }
                }
            );
            map.addControl(clickControl);
            clickControl.activate();
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
            //@if(debug)
            console.log("order="+order + ", measure=" + measure);
            //@endif
            if (order == 1) {
                out += "Length: " + measure.toFixed(3) + " " + units;
            } else {
                out += "Area: " + measure.toFixed(3) + " " + units + "<sup>2</sup>";
            }

            Maps.openLayersController.set('measure', out);
        }
    });

Maps.OpenLayersLayer = SC.View.extend(SC.ContentDisplay, {

    content: null,

    contentDisplayProperties: ["order", "visible", "opacity", "cql_filter"],

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

        var wms = this.wmsLayersCache[layer.get("name")];
        if(layer.get('visible')) {
            if (!wms) {
                // now build the WMS layer
                wms = new OpenLayers.Layer.WMS(
                    layer.get('name'),
                    ( WMSCONFIG.use_cache ? WMSCONFIG.server_cache_path : WMSCONFIG.server_path ),
                    {
                        layers: layer.get('name'),
                        'transparent':'true'
                    },
                    {
                        'opacity': layer.get('opacity')/10,
                        'visibility': layer.get('visible'),
                        'isBaseLayer': false,
                        //'wrapDateLine': true,
                        'buffer': 0
                        //'tileSize': new OpenLayers.Size(512, 512),
                        //'maxExtent': layer.get('maxExtent'),
                        //'minExtent': new OpenLayers.Bounds(-1, -1, 1, 1)
                    }
                );
                // add to the map, the set index to preserve ordering
                map.addLayer(wms);
                //@if(debug)
                console.log(layer.get("name")+".setLayerIndex="+(layer.get("order")-1));
                //@endif
                map.setLayerIndex(wms, layer.get("order")-1);
                // save it into the cache
                this.wmsLayersCache[layer.get("name")]=wms;
            } else {
                wms.setVisibility(layer.get('visible'));
                wms.setOpacity(layer.get('opacity')/10);

                if(layer.get("cql_filter")!=null) {
                    wms.mergeNewParams({"cql_filter": layer.get("cql_filter")});
                    wms.url=WMSCONFIG.server_path;
                } else {
                    wms.mergeNewParams({"cql_filter": null});
                    wms.url=WMSCONFIG.server_cache_path;
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
                if(WMSCONFIG.remove_wms_layers_when_not_used) {
                    map.removeLayer(wms);
                } else {
                    map.setLayerIndex(wms, layer.get("order")-1);
                    wms.setVisibility(layer.get('visible'));
                    wms.redraw();
                }
            }
        }

    }
});
