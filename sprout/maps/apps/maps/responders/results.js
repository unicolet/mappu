Maps.MainResponder = SC.Responder.create({
    // called when the user dblclicks an item in list view
    dblclick: function() {
        var selectedFeature = Maps.featureInfoController.get("selection").firstObject();
        var hasSocial=selectedFeature.get("social");
        var selectionIndex = Maps.featureInfoController.indexOf(selectedFeature);
        var view = Maps.mainPage.mainPane.splitview.bottomRightView.resultsView.contentView.itemViewForContentIndex(selectionIndex);

        if(hasSocial) {
            Maps.socialController.set("content", selectedFeature.get("social"));
            Maps.socialCommentsController.findComments();
        }
        // always fetch links
        Maps.linkController.findLinks();

        SC.PickerPane.create({
            // allow events to bubble up to this responder
            //nextResponder: Maps.MainResponder,
            layout: { width: 400, height: 300 },
            contentView: SC.TabView.extend({
                layout: {top: 5, left: 5, right: 5, bottom: 5},
                itemTitleKey: "title",
                itemValueKey: "tab",
                items: [
                    {title: "Tags", tab: ( hasSocial ? "Maps.mainPage.tagsTab" : "Maps.mainPage.nosocialTab" ) },
                    {title: "Comments", tab: ( hasSocial ? "Maps.mainPage.commentsTab" : "Maps.mainPage.nosocialTab" )},
                    {title: "Links", tab: "Maps.mainPage.linksTab"}
                ]
            })
        }).popup(view, SC.PICKER_POINTER);
    },


    performGeoClose:function() {
        Maps.mainPage.geotools.remove();
    },

    saveTags: function() {
        var guid = Maps.featureInfoController.get("selection").firstObject().attributes()['social'];
        Maps.socialController.saveTags(guid);
    },

    addComment: function() {
        Maps.socialCommentsController.addComment();
    },

    delComment: function() {
        Maps.socialCommentsController.delComment();
    },

    performGeoOperation: function() {
        var op = Maps.featureInfoController.get("operation");
        var geom1 = Maps.featureInfoController.get("feature1geom");
        var geom2 = Maps.featureInfoController.get("feature2geom");
        if (!geom1 && !geom2) {
            SC.AlertPane.warn("Missing Parameters", "Select features and drop them in the drop doxes before attempting a " + op, "", "OK", this);
        } else {
            if (!geom2) {
                geom2 = "";
            }
            if (!geom1) {
                geom1 = "";
            }
            SC.Request.postUrl("/mapsocial/jts/" + op.toLowerCase()).notify(this, 'didPerformGeoOperation').send(geom1.toString() + "*" + geom2.toString());
        }
    },

    didPerformGeoOperation: function(response) {
        if (SC.ok(response)) {
            var payload = response.get("body");
            var WKTParser = new OpenLayers.Format.WKT();
            var features = WKTParser.read(payload);
            if (features) {
                Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
                Maps.openLayersController.getGeotoolsLayer().addFeatures(features);
            }
        } else {
            SC.AlertPane.warn("The requested operation failed", response.get("rawRequest").statusText, 'Error code: ' + response.get("rawRequest").status, "OK", this);
        }
    },

    performGeoClear: function() {
        Maps.openLayersController.clearGeoToolsSelection();
        Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
    },

    layerSearch: function() {
        Maps.openLayersController.hideLayerPane();
        Maps.openLayersController.layerSearch();
    },

    goToEditQuery: function() {
        Maps.openLayersController.goToEditQuery();
    },

    layerQueryBack: function() {
        Maps.openLayersController.goToListQuery();
    },

    layerQueryRun: function() {
        var wfs = new OpenLayers.Protocol.HTTP({
            url:"/geoserver/wfs?service=wfs&version=1.0&request=GetFeature&typename=" + Maps.layerQueryController.getTypeName(),
            format: new OpenLayers.Format.GML.v3({})
        });

        wfs.read({
            params:{
                "CQL_FILTER":Maps.layerQueryController.getCQLFilter()
            },
            callback: this.didFetchWfsFeatures
        });
    },

    didFetchWfsFeatures : function(response, options) {
        //console.log("Maps.MainResponder.didFetchWfsFeatures");
        var gml = new OpenLayers.Format.GML({extractAttributes: true});
        response.features = gml.read(response.priv.responseXML);
        Maps.openLayersController.showInfo(response);
    },

    doRemoveFilter: function() {
        var layer=Maps.openLayersController.get("selection").firstObject();
        if(layer)
                layer.set("cql_filter",null);
    }
});
