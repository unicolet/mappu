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

        SC.Request.getUrl("/mapsocial/social/tags?tags=" + selectedTags).json().notify(this, 'didGatherTagPoints').send();
    },

    didGatherTagPoints: function(response) {
        if (SC.ok(response)) {
            var payload=null;
            if (!response.isJSON())
                payload = SC.$.parseJSON(response.get('body'));
            else
                payload = response.get("body");


            /*
             * Green style
             */
            var style_green = {
                fillColor: "#00FF00",
                pointRadius: 4
            };

            var points=[];
            for(var i=0; i<payload.content.length; i++) {
                //console.log("Adding point for tag:"+payload.content[i].x+" , "+payload.content[i].y);
                var point = new OpenLayers.Geometry.Point(payload.content[i].x, payload.content[i].y);
                var pointFeature = new OpenLayers.Feature.Vector(point,null,style_green);
                points.push(pointFeature);
            }

            var vectorLayer = null;
            var map=Maps.openLayersController.getOLMAP();
            if(map.getLayersByName("_TAGS").length == 0) {
                 vectorLayer = new OpenLayers.Layer.Vector("_TAGS",{
                    displayInLayerSwitcher: false,
                    isBaseLayer: false,
                    visibility: true,
                    opacity: 0.5,
                    renderers: [Maps.TagCanvas , "SVG", "VML"]
                });
                map.addLayer(vectorLayer);
            } else {
                vectorLayer = map.getLayersByName("_TAGS")[0];
                vectorLayer.removeAllFeatures();
            }

            vectorLayer.addFeatures(points);
            vectorLayer.redraw();
        } else {
            SC.AlertPane.warn("_op_failed".loc(), response.get("rawRequest").statusText, 'Error code: ' + response.get("rawRequest").status, "OK", this);
        }
    }
}) ;
