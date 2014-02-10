/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

/*globals Maps */

/** @class

    (Document Your Data Source Here)

 @extends SC.DataSource
 */

sc_require('models/layer');

// made this a local query as this is a recommended best practice in SC 16
Maps.LAYERS_QUERY = SC.Query.local(Maps.Layer, {orderBy:'order'});
Maps.LAYERS_QUERY.set("isEditable", YES);


Maps.LayerDataSource = SC.DataSource.extend(
    /** @scope Maps.LayerDataSource.prototype */ {

        projections : new Array(),
        numberOfProjections: 1,


        // ..........................................................
        // QUERY SUPPORT
        //

        fetch:function (store, query) {
            this.projections = new Array();
            this.numberOfProjections=1;

            if (query === Maps.LAYERS_QUERY) {
                SC.Request.getUrl(WMSCONFIG.server_path + '?service=WMS&version=1.1.1&request=GetCapabilities')
                    .notify(this, 'didFetchCapabilitiesResponse', store, query)
                    .send();
                return YES;
            }
            return NO; // return YES if you handled the query
        },

        didFetchCapabilitiesResponse:function (response, store, query) {
            //@if(debug)
            console.log("In didFetchCapabilitiesResponse. Is response OK? " + SC.ok(response));
            //@endif
            if (SC.ok(response)) {
                //try {
                    var records = [];
                    var content = response.get('body');

                    Maps.openLayersController.detectServerType(content);
                    
		            // God mess IE
                    if(SC.browser.isIE) {
                        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        // required or IE will attempt to validate against DTD, which will, most likely, fail
                        xmlDoc.async = false;
                        xmlDoc.validateOnParse = false;
			            xmlDoc.resolveExternals = false;
                        var parsed=xmlDoc.loadXML(content);
                        if(!parsed) {
                            var myErr = xmlDoc.parseError;
                            alert(myErr.reason);
                        } else {
                            content=xmlDoc;
                        }
                    }
                    var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
                    var capabilities = wmsCapabilities.read(content);
                    var numLayers = capabilities.capability.layers.length;
                    var layers = capabilities.capability.layers;
                    var order = 1;

                    // this outer loop is necessary to preload proj definitions
                    for (var i = 0; i < numLayers; i++) {
                        var l = layers[i];
                        // read bbox from layer
                        var bbox = null;
                        for (var b in l.bbox) {
                            if (l.bbox[b].srs)
                                bbox = l.bbox[b];
                        }
			        if(!Proj4js.defs[bbox.srs]) // load projection from remote sources
                        this.projections.push(bbox.srs)
                    }
                    var tmpProjections=this.projections.uniq();
                    this.projections = tmpProjections.slice(); // clone array
                    this.numberOfProjections=this.projections.length;
                    //@if(debug)
                    console.log("Requiring remote load of " + this.projections.length + " projections, nofProjections="+this.numberOfProjections);
                    //@endif
                    for (var i = 0; i < tmpProjections.length; i++) {
                        //@if(debug)
                        console.log("["+i+"] Requiring remote load of projection " + tmpProjections[i]);
                        //@endif
                        var proj = new Proj4js.Proj(tmpProjections[i], this.whenProjReady(tmpProjections[i], response, store, query, capabilities));
                    }

                    // if all projections are available locally continue as usual
                    if(this.numberOfProjections==0) {
                        Maps.updateStateProgress(50);
                        this.doFetchLayers(response, store, query, capabilities);
                    }

                //} catch (e) {
                //    store.dataSourceDidErrorQuery(query, response);
                //    this.notifyError({status:e});
               // }
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        doFetchLayers:function (response, store, query, capabilities) {
            //@if(debug)
            console.log("Proceeding to load layer definitions...");
            //@endif
            var records = [];
            var numLayers = capabilities.capability.layers.length;
            var layers = capabilities.capability.layers;
            var order = 1;

            // now we actually add the layers
            for (var i = 0; i < numLayers; i++) {
                Math.round(50 + Math.round(50*i/numLayers));

                var l = layers[i];
                if (l.keywords.contains("mappu_disable")) {
                    //@if(debug)
                    console.log("Skipping layer " + l.name);
                    //@endif
                } else {
                    // read bbox from layer
                    var bbox = null;
                    for (var b in l.bbox) {
                        if (l.bbox[b].srs)
                            bbox = l.bbox[b];
                    }
                    var bounds = new OpenLayers.Bounds(
                        bbox.bbox[0],
                        bbox.bbox[1],
                        bbox.bbox[2],
                        bbox.bbox[3]
                    );
                    bounds=bounds.transform(new OpenLayers.Projection(bbox.srs), new OpenLayers.Projection('EPSG:900913'));

                    var legend = null;
                    try {
                        legend = l.styles[0].legend.href;
                    } catch (e) {
                    }

                    var record = {
                        order: Maps.Session.getItem("Maps.Layer." + l.name + ".order",order++),
                        guid:i,
                        name:l.name,
                        title:l.title,
                        visible: Maps.Session.getItemAsBoolean("Maps.Layer." + l.name + ".visible",l.keywords.contains("mappu_disable")),
                        legendIcon:legend,
                        opacity:Maps.Session.getItem("Maps.Layer." + l.name + ".opacity",10),
                        description:l['abstract'],
                        cql_filter:null,
                        maxExtent:bounds,
                        srs:bbox.srs
                    };
                    records[records.length] = record;

                    // save initial order
                    Maps.Session.setItem("Maps.Layer." + l.name + ".order",order);

                    // if first layer then use it to zoom the map
                    if (i == 0) {
                        // transform the bbox to 900913 and have KVO notify the map
                        Maps.set("bbox", bounds);
                        //@if(debug)
                        console.log("Map Bounds:" + bounds);
                        //@endif
                    }
                }
            }
            Maps.updateStateProgress(100);
            //@if(debug)
            console.log("WMS Capabilities loading completed.");
            //@endif

            SC.run(function() {
                Maps.statechart.sendEvent("loadingCompleted",100);
                var storeKeys = store.loadRecords(Maps.Layer, records);
                store.dataSourceDidFetchQuery(query);
            });
        },

        whenProjReady:function (projCode, response, store, query, capabilities) {
            //@if(debug)
            console.log("- proj "+projCode+" loaded , projections.length="+this.projections.length);
            //@endif

            this.projections.pop();
            if (this.projections.length <= 0) {
                Maps.updateStateProgress(50);
                this.doFetchLayers(response, store, query, capabilities)
		    } else {
                Maps.updateStateProgress(Math.round(50*this.numberOfProjections/this.projections.length));
            }
        },

        // ..........................................................
        // RECORD SUPPORT
        //

        retrieveRecord:function (store, storeKey) {
            return YES;
        },

        createRecord:function (store, storeKey) {
            return YES;
        },

        updateRecord:function (store, storeKey) {
            var dataHash = store.readDataHash(storeKey);
            store.dataSourceDidComplete(storeKey, null);

            // persist to localStorage
            try {
                var recordType=store.recordTypeFor(storeKey);
                var guid=dataHash['name'];
                Maps.Session.setItem(recordType+"."+guid+".visible", dataHash['visible']);
                Maps.Session.setItem(recordType+"."+guid+".order", dataHash['order']);
                Maps.Session.setItem(recordType+"."+guid+".opacity", dataHash['opacity']);
                //@if(debug)
                console.log("Saved order,visible to localStorage for guid="+guid);
                //@endif
            } catch(e) {
                log.error(e);
            }

            return YES;
        },

        destroyRecord:function (store, storeKey) {
            return YES;
        },

        notifyError:function (response) {
            SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + response.status, "", "OK", this);
        }
    });
