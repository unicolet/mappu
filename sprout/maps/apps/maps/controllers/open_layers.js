// ==========================================================================
// Project:   Maps.openLayersController
// Copyright: �2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/

var size = new OpenLayers.Size(21,25);
var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
var iconSelected = new OpenLayers.Icon(sc_static('/images/pin_selected.png'),size,offset);
var icon = new OpenLayers.Icon(sc_static('/images/pin.png'),size,offset);
var currentMarker = null;

Maps.openLayersController = SC.ArrayController.create(
/** @scope Maps.openLayersController.prototype */ {

	olmap : null,
	layerPalette : null,
	wms : null,
	measureControls: null,
	measure: null,
	FEATURE_INFO_LAYER:null,
	GEOTOOLS_LAYER:null,
	MARKERS_LAYER:null,
	geotools: null,
	
	react : function() {
		var tool = Maps.mainPage.mainPane.toolbar.tools.get("value");
		//console.log("%@ value=%@".fmt(this,tool));
		if (tool=='toolMove') {
			this.toolMove();
			Maps.openLayersController.set('measure', '');
		}
		if (tool=='toolArea') {
			this.toolArea();
		}
		if (tool=='toolLength') {
			this.toolLength();
		}
		if (tool=='toggleLayers') {
			this.toggleLayers();
		}
		if (tool=='toolGeo') {
			if (this.get("geotools")) {
                this.clearGeoToolsSelection();
                // reset
                if (!this.get("geotools").isVisibleInWindow) {
                    this.get("geotools").append();
                }
			} else {
				var geotools = SC.PalettePane.create({
                    // Se this to route events to our responder
                    nextResponder: Maps.MAIN_RESPONDER,
					layout: { width: 144, height: 159, left: 200, top: 100 },
					contentView: Maps.mainPage.geoTools
				}).append();
				this.set("geotools", geotools);
			}
			Maps.mainPage.mainPane.toolbar.tools.set("value","toolMove");
		}
	}.observes("Maps.mainPage.mainPane.toolbar.tools.value"),

    clearGeoToolsSelection: function() {
        Maps.featureInfoController.set("feature1", null);
        Maps.featureInfoController.set("feature2", null);
        Maps.featureInfoController.set("feature1geom", null);
        Maps.featureInfoController.set("feature2geom", null);
    },

	toolMove : function() {
		var measureControls = this.get('measureControls');
		for(key in measureControls) {
                var control = measureControls[key];
                if('none' == key ) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
        return "Move";
	},
	
	toolArea : function() {
		var measureControls = this.get('measureControls');
		for(key in measureControls) {
                var control = measureControls[key];
                if('polygon' == key ) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
        return "Area";
	},

	toolLength : function() {
		var measureControls = this.get('measureControls');
		for(key in measureControls) {
                var control = measureControls[key];
                if('line' == key ) {
                    control.activate();
                } else {
                    control.deactivate();
                }
            }
        return "Length";
	},

	toggleLayer: function(layer, status) {
		var olLayer=this.get('olmap').getLayersByName(layer.split(':')[0])[0];
		var layers=[];
		if(olLayer.params['LAYERS']) {
			layers = olLayer.params['LAYERS'].split(',');
		}
		
		if (!status) {
			layers = SC.$.grep(
				layers,
				function(value) {return value != layer;}
				);
		} else {
			layers.push(layer);
		}
		
		if(layers.length!=0) {
			olLayer.mergeNewParams({'layers':layers.join(',')});
			olLayer.setVisibility(true);
			olLayer.redraw();
			//console.log("layer "+layer+" requested redraw.");
		} else {
			olLayer.mergeNewParams({'layers':null});
			olLayer.setVisibility(false);
			//console.log("layer "+layer+" hid group.");
		}
	},
	
	installOpenLayersControl: function() {
		if( this.get("content").status == SC.Record.READY_CLEAN) {
			var options = {
                tileSize: new OpenLayers.Size(512,512),
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
			
			//var layerList=this.get("content").filterProperty('isVisible').getEach("name");			
			var layerList=this.get("content");			
			var layerGroups=new Object();
			layerList.forEach(function(item, i, e) {
					var groupName = item.get("name").split(':')[0];
					var layerName = item.get("name");
					if(!layerGroups[groupName]) {
						layerGroups[groupName]=[];
					}
					if (item.get("isVisible")) {
						layerGroups[groupName].push(layerName);
					}
			});
			for(var item in layerGroups) {
				var wms = new OpenLayers.Layer.WMS(
											item,
											"/geoserver/wms",
											 {
											 	 layers: layerGroups[item].length!=0 ? layerGroups[item].join(',') : null,
											 	 'transparent':'true'
											 },
											 {
											 	 'opacity': 0.7,
											 	 visibility: layerGroups[item].length!=0,
											 	 'isBaseLayer': false,
											 	 'wrapDateLine': true
											 }
											);
				map.addLayer(wms);
			}
			var featureInfoLayer = new OpenLayers.Layer.Vector("Feature Info Layer", {
					displayInLayerSwitcher: false, 
					isBaseLayer: false,
					visibility: true
            	});
            map.addLayer(featureInfoLayer);
            this.set('FEATURE_INFO_LAYER',featureInfoLayer);

            var geoStyleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
                {fillColor: "green", fillOpacity: 0.7, strokeColor: "black"},
                OpenLayers.Feature.Vector.style["default"]));
            var geoToolsLayer = new OpenLayers.Layer.Vector("Geo Tools Layer", {
                    displayInLayerSwitcher: false,
                    isBaseLayer: false,
                    visibility: true,
                    styleMap:geoStyleMap});
            map.addLayer(geoToolsLayer);
            this.set('GEOTOOLS_LAYER',geoToolsLayer);
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            map.addLayer(markers);
            this.set('MARKERS_LAYER',markers);
			
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
            for(var key in measureControls) {
                control = measureControls[key];
                control.events.on({
                    "measure": this.handleMeasurements,
                    "measurepartial": this.handleMeasurements
                });
                map.addControl(control);
            }
            this.set('measureControls',measureControls);
			
            // get geature info handlers
            var infoControls = {
				click: new OpenLayers.Control.WMSGetFeatureInfo({
					url: '/geoserver/wms', 
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

            map.addControl(new OpenLayers.Control.LayerSwitcher());
            infoControls.click.activate();
            // end get geature info section
            
			map.setCenter(new OpenLayers.LonLat(1325724, 5694253), 12);
			// some brutal z-index hacking
			map.layerContainerDiv.style.zIndex=map.Z_INDEX_BASE['Popup']-1;
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
            while(markersLayer.markers.length > 0) {
            	markersLayer.removeMarker(markersLayer.markers[0]);
            }
            highlightLayer.removeAllFeatures();
            
            for (var i=0; i<event.features.length; i++) {
            	var feature = event.features[i];
            	var c = feature.geometry.getCentroid().transform(gaussBoagaProj, googleProj);
            	var marker = new OpenLayers.Marker(new OpenLayers.LonLat(c.x,c.y),icon.clone());
            	feature.geometry = feature.geometry.transform(gaussBoagaProj, googleProj);
            	marker.data={'feature':feature, 'idx':i};
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
            Maps.FeatureDataSource.rawFeatures=event.features;
            if (!Maps.features) { 
            	Maps.features = Maps.featuresStore.find(Maps.FEATURE_QUERY);
            	Maps.featureInfoController.set('content',Maps.features);
            } else {
            	Maps.features.refresh();
            }
            if (Maps.first_time == YES) {
            	Maps.mainPage.mainPane.toolbar.layers.set("value","RESULTS");
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
		if(order == 1) {
			out += "Length: " + measure.toFixed(3) + " " + units;
		} else {
			out += "Area: " + measure.toFixed(3) + " " + units + "<sup>2</sup>";
		}	
		//console.log(out);
		Maps.openLayersController.set('measure', out);
	},
	
	changeGoogle: function() {
		var newBaseLayer = "Google " + this.get("layerPalette").contentView.googleView.get('value'); 
		var map = this.get("olmap");
		map.setBaseLayer(map.getLayersByName(newBaseLayer)[0]);
	},
	
	toggleLayers: function() {
		var selected = Maps.mainPage.mainPane.toolbar.layers.get("value");
		
		// make selected always an array
		if (! $.isArray(selected)) {
			selected = (selected+"").w();
		}
		
		var palette = this.get("layerPalette");
		if ( selected.find(function(i,j,l){return i=="LAYERS"}) ) {
			if (!palette) {
				palette = SC.PickerPane.extend({
				  //classNames: ['gh-picker'],
                  nextResponder: Maps.MAIN_RESPONDER,
				  layout: { top: 100, right: 50, width: 200, height: 300 },
				  contentView: Maps.mainPage.layersPane
				}).create();

				palette.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
				this.set("layerPalette",palette);
				palette.addObserver('contentView.googleView.value',this,this.changeGoogle);
			} else {
				palette.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
			}
		} else {
			this.hideLayerPane();
		}
        if ( selected.find(function(i,j,l){return i=="SEARCH"}) ) {
            this.layerSearch();
        } else {
            this.hideLayerSearch();
        }
	}.observes("Maps.mainPage.mainPane.toolbar.layers.value"),
	
	checkLayerPaneHidden: function() {
		if(!this.get("layerPalette").isVisibleInWindow) {
			//console.log("Toggle the button");
			Maps.mainPage.mainPane.toolbar.layers.set("value","".w());
		}
	}.observes(".layerPalette.isVisibleInWindow"),

    checkLayerSearchHidden: function() {
		if(!this.get("layerSearchPane").isVisibleInWindow) {
			//console.log("Toggle the button");
			Maps.mainPage.mainPane.toolbar.layers.set("value","".w());
		}
	}.observes(".layerSearchPane.isVisibleInWindow"),

    hideLayerPane: function() {
        var palette = this.get("layerPalette");
        if (palette) palette.remove();
    },

    layerSearchPane:null,
    layerSearchNowShowing:null,

    layerSearch: function() {
        var palette=this.get("layerSearchPane")
        if(!palette) {
            palette = SC.PickerPane.design({
                      //classNames: ['gh-picker'],
                      nextResponder: Maps.MAIN_RESPONDER,
                      layout: { height: 200, width: 400},
                      contentView: SC.SceneView.design({
                          layout: {top:0,bottom:0,left:0,right:0},
                          scenes: ["Maps.mainPage.queryListPane", "Maps.mainPage.queryEditPane"],
                          nowShowingBinding: "Maps.openLayersController.layerSearchNowShowing"
                      })
                    }).create();
            this.set("layerSearchPane",palette);
        }
        palette.popup(Maps.mainPage.mainPane.toolbar.layers, SC.PICKER_POINTER);
        this.goToListQuery();
    },

    goToEditQuery: function() {
        this.set("layerSearchNowShowing","Maps.mainPage.queryEditPane");
    },

    goToListQuery: function() {
        this.set("layerSearchNowShowing","Maps.mainPage.queryListPane");
    },

    hideLayerSearch: function() {
        var palette = this.get("layerSearchPane");
        if (palette) palette.remove();
    }
    
}) ;
