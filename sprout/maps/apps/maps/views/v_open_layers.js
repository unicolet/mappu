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

OpenLayers.ImgPath = 'source/resources/img/';

//@if(debug)
OpenLayers.ImgPath = '';
//@endif

// backward compatility check (for mappu versions that do not define MAPPU_BASELAYERS in app_config.js)
var MAPPU_BASELAYERS=MAPPU_BASELAYERS||null;


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

        didShowNoFeatureInfoResultsWarning: false,
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
            //@if(debug)
            console.log("++ Maps.OpenLayers.didContentChange ++");
            //@endif

            var content=this.get("content");
            var childViews=this.get("childViews");

            if(childViews && content) {
                for(var i=childViews.length; i < content.length(); i++) {
                    // add new childView...
                    var layer=Maps.OpenLayersLayer.design({
                        content: content.objectAt(i)
                    }).create();
                    this.appendChild(layer);
                }
            }
        }.observes(".content.length",".content"),

        didAppendToDocument: function() {
            this.initOpenLayers();
            var layer = this.get("layer"),
                map   = this.get("olmap");

            setTimeout(function(){map.render(layer);},0);
        },

        initOpenLayers: function() {
            OpenLayers.DOTS_PER_INCH = 90.71428571428572;
            var options = {
                tileSize: new OpenLayers.Size(256, 256),
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                numZoomLevels: 21,
                maxResolution: 78271.516953125,
                maxExtent: new OpenLayers.Bounds(-20037508, -20037508,20037508, 20037508.34),
                units: 'm',
                fallThrough: false
                //,fractionalZoom: true // required for zoomToScale to work precisely
                };
            var map = new OpenLayers.Map(options);

            this.addBaseLayers(map);
            /*
             * Utility layers will be lazy-added at first use, see
             * Maps.openLayersController.getFeatureInfoLayer
             *
             * This to both reduce startup time and ensure that they
             * are added at the bottom of the layer list.
             *
             * */
            this.addControls(map);

            map.events.register("changelayer",Maps.openLayersController, Maps.openLayersController.handleZOrderingChange);
            map.events.register("moveend",Maps.openLayersController, Maps.openLayersController.handleMoveEnd);

            this.invokeLast(function(){
                if (Maps.get("shouldZoom")==YES) {
                    if(Maps.get("bbox")!=null) {
                        //@if(debug)
                        console.log("Zooming to bbox "+Maps.get("bbox"));
                        //@endif
                        map.zoomToExtent(Maps.get("bbox"), true);
                        if(WMSCONFIG.default_zoom_level) {
                            map.zoomTo(WMSCONFIG.default_zoom_level);
                        } else {
                            map.zoomTo(map.getZoomForExtent(Maps.get("bbox")));
                        }
                    } else {
                        map.setCenter(new OpenLayers.LonLat(1325724, 5694253), WMSCONFIG.default_zoom_level);
                    }
                }
            });

            this.set('olmap', map);
        },

        bboxDidChange: function() {
            if(Maps.get("bbox") && this.get("olmap")) {
                var map=this.get("olmap");

                // sometimes we shouldn't zoom because the user has routed us to a certain location
                if (Maps.get("shouldZoom")==YES) {
                    //@if(debug)
                    console.log("Zooming map to content");
                    //@endif
                    map.zoomTo(map.getZoomForExtent(Maps.get("bbox")));
                    map.zoomToExtent(Maps.get("bbox"), true);
                }
            }
        }.observes("Maps.bbox"),

        addBaseLayers: function(map) {
            var layers=[];
            if(MAPPU_BASELAYERS && MAPPU_BASELAYERS.length>0) {
                for(var i=0,l=MAPPU_BASELAYERS.length;i<l;i++) {
                    var layer=Maps.createLayer(MAPPU_BASELAYERS[i]);
                    if(layer) {
                        MAPPU_BASELAYERS[i].ready=true;
                        layers.push(layer);
                    } else {
                        MAPPU_BASELAYERS[i].ready=false;
                        //@if(debug)
                        console.log("Failed to create layer: "+MAPPU_BASELAYERS[i].name);
                        //@endif
                    }
                }
            } else {
                //@if(debug)
                console.log("Creating standard google layers");
                //@endif

                // create standard Google Mercator layers
                var googleStreets = new OpenLayers.Layer.Google(
                    "Google Streets",
                    {'sphericalMercator': true}
                );
                var googleHybrid = new OpenLayers.Layer.Google(
                    "Google Satellite",
                    {'type': google.maps.MapTypeId.SATELLITE, 'sphericalMercator': true}
                );
                layers.push(googleStreets);
                layers.push(googleHybrid);
            }
            for(var i= 0, l=layers.length;i<l;i++) {
                map.addLayer(layers[i]);
                try {
                    if(layers[i].mapObject && layers[i].mapObject.setTilt) {
                        // disable tilt: need to do it this way until OL merges: http://trac.osgeo.org/openlayers/ticket/3615
                        layers[i].mapObject.setTilt(0);
                    }
                } catch(e) {
                    console.log("Error disabling Google Satellite imagery tilt");
                }

            }
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
            featureInfoControl.events.register("nogetfeatureinfo", Maps.openLayersController, function(){
                Maps.set("isLoading",NO);
                Maps.openLayersController.didShowNoFeatureInfoResultsWarning=true;
                SC.AlertPane.warn({
                    message: "_no_queriable_layers_title".loc(),
                    description: "_no_queriable_layers_detail".loc(),
                    buttons: [{title: "OK", action: "openLayerPane"}]
                });
            });

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
                out += "Area: " + measure.toFixed(2) + " " + units + "<sup>2</sup>";
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
    }
});
