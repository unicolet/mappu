/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
Maps.MainResponder = SC.Responder.create({



    doOpenLayerWithGoogleEarth: function() {
        var ws=Maps.layerController.get("name").split(":")[0];
        window.open("/geoserver/"+ws+"/wms/kml?layers="+Maps.layerController.get("name"))
    },

    print: function(){
        if(SC.browser.chrome) {
            SC.AlertPane.info({
                message: "_print_chrome_title".loc(),
                description: "_print_chrome_body".loc(),
                caption: "",
                buttons: [
                    {
                    title: "_install_print_extension".loc(),
                    action: "didClickInstallPrintExtension"
                    },
                    {
                      title: "OK"
                    }
                ]});
        } else if(SC.browser.mozilla) {
            SC.AlertPane.info({
                message: "_print_mozilla_title".loc(),
                description: "_print_mozilla_body".loc(),
                caption: "",
                buttons: [
                    {
                    title: "_install_print_extension".loc(),
                    action: "didClickInstallPrintExtension"
                    },
                    {
                      title: "OK"
                    }
                ]});
        } else {
            SC.AlertPane.info({
                message: "_working_on_it".loc(),
                description: "_working_on_it".loc(),
                caption: "",
                buttons: [
                    {
                      title: "OK"
                    }
                ]});
        }
    },

    didClickInstallPrintExtension: function() {
        if(SC.browser.chrome) {
            window.open(APPCONFIG.print.chrome);
        } else if(SC.browser.mozilla) {
            window.open(APPCONFIG.print.firefox);
        } else {
            window.open(APPCONFIG.print.other);
        }
    },

    // have this code sync with that in olcontroller
    legend: NO,
    toggleLegend: function() {
        if(!this.legend)
            Maps.openLayersController.goToLegend();
        else
            Maps.openLayersController.goToDetail();
        this.set("legend", !this.legend );
    },
    legendBtnText: function() {
        if(this.legend)
            return "_layerprops".loc()
        else
            return "_legend".loc()
    }.property("legend"),

    showAdvancedOptions: function() {
        window.open(APPCONFIG.advanced_options);
    },



    maps_SaveTags: function() {
        var feature = Maps.featureInfoController.get("selection").firstObject();
        Maps.socialController.saveTags(feature);
    },

    maps_AddComment: function() {
        Maps.socialCommentsController.addComment();
    },

    maps_DelComment: function() {
        Maps.socialCommentsController.delComment();
    },



    maps_LayerSearch: function() {
        Maps.openLayersController.hideLayerPane();
        Maps.openLayersController.layerSearch();
    },

    maps_GoToEditQuery: function() {
        Maps.openLayersController.goToEditQuery();
    },

    layerQueryBack: function() {
        Maps.openLayersController.goToListQuery();
    },

    layerQueryRun: function() {
        var wfs = new OpenLayers.Protocol.HTTP({
            url:WMSCONFIG.wfs_server_path+"?service=wfs&version=1.0&request=GetFeature&typename=" + Maps.layerQueryController.getTypeName(),
            format: new OpenLayers.Format.GML.v3({})
        });

        // start spinner
        Maps.set("isLoading", YES);

        wfs.read({
            params:{
                "CQL_FILTER":Maps.layerQueryController.getCQLFilter()
            },
            callback: this.didFetchWfsFeatures
        });
    },

    didFetchWfsFeatures : function(response, options) {
        try {
            var gml = new OpenLayers.Format.GML({extractAttributes: true});
            response.features = gml.read(response.priv.responseXML);
            Maps.openLayersController.showInfo(response);
        } catch(e) {
            SC.AlertPane.warn("_op_failed".loc(), response.error, '_no_info_avail'.loc(), "OK", this);
        }
        // stop spinner
        Maps.set("isLoading", NO);
    },

    doRemoveFilter: function() {
        var layer=Maps.openLayersController.get("selection").firstObject();
        if(layer)
                layer.set("cql_filter",null);
    },

    /*
     * Use the gmaps api to reverse geocode a lat,lon couple
     */
    geocode: function() {
        Maps.addressController.findAddresses(Maps.openLayersController.get("lat"), Maps.openLayersController.get("lon"));
    },

    /*
     * launch streetview in a browser window
     */
    streetview: function() {
        window.open("http://maps.google.it/?ll="+Maps.openLayersController.get("lat")+","+Maps.openLayersController.get("lon")+"&t=m&z=19&vpsrc=6", "mappu_gmaps");
    }
});
