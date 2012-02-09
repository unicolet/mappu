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
Maps.LAYERS_QUERY = SC.Query.local(Maps.Layer, {orderBy: 'order'});
Maps.LAYERS_QUERY.set("isEditable",YES);

Maps.LayerDataSource = SC.DataSource.extend(
/** @scope Maps.LayerDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {

	if (query === Maps.LAYERS_QUERY ) {
	  SC.Request.getUrl(WMSCONFIG.server_path+'?service=WMS&version=1.1.1&request=GetCapabilities')
	  .notify(this, 'didFetchLayers', store, query)
	  .send();
	  return YES;
	}
    return NO ; // return YES if you handled the query
  },
  
  didFetchLayers: function(response, store, query) {
	if (SC.ok(response)) {
        try {
            var records = [];
            var content = response.get('body');

            var wmsCapabilities=new OpenLayers.Format.WMSCapabilities();
            var capabilities=wmsCapabilities.read(content);
            var numLayers=capabilities.capability.layers.length;
            var layers=capabilities.capability.layers;
            var order=1;

            for(var i=0;i<numLayers;i++) {
                var l=layers[i];
                if(l.keywords.contains("mappu_disable")) {
                    //@if(debug)
                    console.log("Skipping layer "+l.name);
                    //@endif
                } else {
                    // read bbox from layer
                    var bbox=null;
                    for (var b in l.bbox) {
                        if(l.bbox[b].srs)
                            bbox=l.bbox[b];
                    }
                    var bounds = new OpenLayers.Bounds(
                        bbox.bbox[0],
                        bbox.bbox[1],
                        bbox.bbox[2],
                        bbox.bbox[3]
                    );
                    bounds.transform(new OpenLayers.Projection(bbox.srs),new OpenLayers.Projection('EPSG:900913'));

                    var legend=null;
                    try {
                        legend=l.styles[0].legend.href;
                    } catch(e) {}

                    var record={
                                order: order++,
                    guid: i,
                                name: l.name,
                                title: l.title,
                    visible : l.keywords.contains("mappu_disable"),
                    legendIcon : legend,
                                opacity: 10,
                                description: l['abstract'],
                                cql_filter: null,
                                maxExtent: bounds,
                                srs: bbox.srs
            };
                    records[records.length]=record;

                    // if first layer then use it to zoom the map
                    if(i==0) {
                        // transform the bbox to 900913 and have KVO notify the map
                        Maps.set("bbox",bounds);
                        //@if(debug)
                        console.log("Map Bounds:"+bounds);
                        //@endif
                    }

                }

            }

            var storeKeys = store.loadRecords(Maps.Layer, records);
            store.dataSourceDidFetchQuery(query);
        } catch(e) {
            store.dataSourceDidErrorQuery(query, response);
            this.notifyError({status:e});
        }
	} else {
		store.dataSourceDidErrorQuery(query, response);
        this.notifyError(response);
	}
  },

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    return YES ;
  },
  
  createRecord: function(store, storeKey) {
    return YES ;
  },
  
  updateRecord: function(store, storeKey) {
	  var dataHash   = store.readDataHash(storeKey);
	  //Maps.openLayersController.toggleLayer(dataHash['name'], dataHash['isVisible']);
	  store.dataSourceDidComplete(storeKey, null) ;
      return YES ;
  },
  
  destroyRecord: function(store, storeKey) {
    return YES ;
  },

  notifyError: function(response) {
      SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + response.status, "", "OK", this);
  }
}) ;
