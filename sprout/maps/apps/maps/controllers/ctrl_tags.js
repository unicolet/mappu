/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
/*globals Maps */

//sc_require("TagCanvas");

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/

Maps.tagsController = SC.ArrayController.create(
/** @scope Maps.tagsController.prototype */ {

    selectedTags: '',

    updateHTTPProtocolFilter: function() {
        var layer = this.maybeAddVectorLayer();
        if(layer) {
            layer.protocol.params={'tags': this.get("selectedTags")};
            // no tags requeste, just empty the layer
            if(!this.get("selectedTags") || this.get("selectedTags")=="") {
                layer.removeAllFeatures();
            }
            layer.strategies[0].refresh();
        }
    }.observes("selectedTags"),

    hideVectorLayer: function() {
        var vectorLayer = null;
        var map=Maps.openLayersController.getOLMAP();
        if(map.getLayersByName("_TAGS").length != 0) {
            vectorLayer = map.getLayersByName("_TAGS")[0];
            vectorLayer.removeAllFeatures();
        }
        vectorLayer.display(false);
    },

    gatherTagPoints: function() {
        var selectedTags="";
        var tagSummaries=this.get("content");
        for(var i=0;i<tagSummaries.length();i++) {
            var item=tagSummaries.objectAt(i);
            if(item.get("visible")) {
                if(selectedTags=="")
                    selectedTags=item.get("tag");
                else
                    selectedTags=selectedTags+","+item.get("tag");
            }
        }

        this.set("selectedTags", selectedTags);
        // there is an observer which will trigger layer creation
    },

    maybeAddVectorLayer: function() {
        var vectorLayer = null;
        var map=Maps.openLayersController.getOLMAP();
        if(map.getLayersByName("_TAGS").length == 0) {
             vectorLayer = new OpenLayers.Layer.Vector("_TAGS",{
                strategies: [new OpenLayers.Strategy.Refresh({force:true}), new OpenLayers.Strategy.BBOX({ratio:2, resFactor: 3})],
                protocol: new Maps.DynamicHTTP({
                    url:  "/mapsocial/social/tags",
                    params: {'tags': this.get("selectedTags")},
                    userCallback: Maps.tagsController.didGatherTagPoints,
                    userTarget: Maps.tagsController,
                    format: new OpenLayers.Format.JSON()
                }),
                displayInLayerSwitcher: false,
                isBaseLayer: false,
                visibility: true,
                opacity: 0.5,
                renderers: [Maps.TagCanvas , "SVG", "VML"]
            });
            map.addLayer(vectorLayer);
        } else {
            vectorLayer = map.getLayersByName("_TAGS")[0];
        }
        return vectorLayer;
    },

    didGatherTagPoints: function(scope,response) {
        console.log("Adding vector points...");
        var vectorLayer = this.maybeAddVectorLayer();
        vectorLayer.removeAllFeatures();
        /*
         * Dummy style to get rendering validated by OL code
         */
        var style = {};

        var points=[];
        for(var i=0; i<response.features.content.length; i++) {
            //console.log("Adding point for tag:"+payload.content[i].x+" , "+payload.content[i].y);
            var point = new OpenLayers.Geometry.Point(response.features.content[i].x, response.features.content[i].y);
            var pointFeature = new OpenLayers.Feature.Vector(point,null,style);
            points.push(pointFeature);
        }
        vectorLayer.addFeatures(points);
        vectorLayer.redraw();
    }
}) ;
