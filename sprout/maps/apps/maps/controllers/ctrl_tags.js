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

Maps.tagsController = SC.ArrayController.create(
/** @scope Maps.tagsController.prototype */ {

    selectedTags: '',

    /*
     * Max number of tags to render. Used to safeguard against performance degradation when
     * large number of tags come into play.
    */
    maxTagsToRender: 4,

    updateHTTPProtocolFilter: function() {
        Maps.set("isLoading", true);
        var layer = this.maybeAddVectorLayer();
        if(layer) {
            layer.protocol.params={'tags': this.get("selectedTags")};
            // no tags requeste, just empty the layer
            if(!this.get("selectedTags") || this.get("selectedTags")=="") {
                layer.removeAllFeatures();
            } else {
                layer.strategies[0].refresh();
            }
            layer.setVisibility(true);
        }
    }.observes("selectedTags"),

    hideTagsLayer: function() {
        var vectorLayer = null;
        var map=Maps.openLayersController.getOLMAP();
        if(map.getLayersByName("_TAGS").length != 0) {
            vectorLayer = map.getLayersByName("_TAGS")[0];
            vectorLayer.removeAllFeatures();
            vectorLayer.setVisibility(false);
        }
    },

    refreshTagsLayer: function() {
        var vectorLayer = null;
        var map=Maps.openLayersController.getOLMAP();
        if(map.getLayersByName("_TAGS").length != 0) {
            vectorLayer = map.getLayersByName("_TAGS")[0];
            vectorLayer.strategies[0].refresh();
            return true;
        }
        return false;
    },

    gatherTagPoints: function() {
        this.set("selectedTags", "");

        var countMax = this.get("maxTagsToRender");
        var count=0;
        var selectedTags="";
        var tagSummaries=this.get("content");
        for(var i=0; i<tagSummaries.length() ;i++) {
            var item=tagSummaries.objectAt(i);
            if(item.get("visible")) {
                count++;
                if(count<=countMax) {
                    if(selectedTags=="")
                        selectedTags=item.get("tag");
                    else
                        selectedTags=selectedTags+","+item.get("tag");
                }
            }
        }
        if(count>countMax) {
            SC.AlertPane.warn("_max_tags_title".loc(countMax), "_max_tags_body".loc(countMax), "", "OK", this);
        }

        this.set("selectedTags", selectedTags);
        // there is an observer which will trigger layer creation
    },

    maybeAddVectorLayer: function() {
        var vectorLayer = null;
        var map=Maps.openLayersController.getOLMAP();
        if(map.getLayersByName("_TAGS").length == 0) {
             vectorLayer = new Maps.TagVector("_TAGS",{
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
        var vectorLayer = this.maybeAddVectorLayer();
        vectorLayer.removeAllFeatures();
        vectorLayer.addFeatures(response.features.content);
        vectorLayer.redraw();

        Maps.set("isLoading", false);
    }
}) ;
