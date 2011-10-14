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
	  SC.Request.getUrl('/geoserver/wms?service=WMS&version=1.1.1&request=GetCapabilities')
	  .notify(this, 'didFetchLayers', store, query)
	  .send();
	  return YES;
	}
    return NO ; // return YES if you handled the query
  },
  
  didFetchLayers: function(response, store, query) {
	//console.log('in didFetchLayers');
	if (SC.ok(response)) {
		var records = [];
		var content = response.get('body');
        // God mess IE
        if(SC.$.browser.msie) {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            var parsed=xmlDoc.loadXML(content);
            if(!parsed) {
                var myErr = xmlDoc.parseError;
                alert(myErr.reason);
            } else {
                content=xmlDoc;
            }
        }

		SC.$('Layer', content).each(
			function(index) {
                // read the bounding box from the first
                if(index==0) {
                    var bbox=$(this).find("LatLonBoundingBox:first");
                    var bounds = new OpenLayers.Bounds(
                        bbox.attr("minx"),
                        bbox.attr("miny"),
                        bbox.attr("maxx"),
                        bbox.attr("maxy")
                    );
                    // transform the bbox to 900913 and have KVO notify the map
                    Maps.set("bbox",bounds.transform(new OpenLayers.Projection('EPSG:4326'),new OpenLayers.Projection('EPSG:900913')));
                }
				// can now skip first and proceed
				if ( index!=0 && $(this).attr('queryable')!="0" ) {
					var theName = $(this).find('Name:first').text();
					if (theName!="blank:blank") {
                        var theLegendIcon = null;
                        try {
                            if(SC.$.browser.msie) {
                                theLegendIcon = $(this.find("Style:first OnlineResource")).attr('xlink:href');
                            } else {
						        theLegendIcon = $(this.getElementsByTagName('Style')[0].innerHTML).find("OnlineResource").attr('xlink:href');
                            }
                        } catch(e) {};
                        
                        // now for the BoundingBox
                        var bbox=$(this).find('BoundingBox:first');
                        var bounds = new OpenLayers.Bounds(bbox.attr('minx'),bbox.attr('miny'),bbox.attr('maxx'),bbox.attr('maxy'));

						var record={
                            order: index,
							guid: index,
							name: theName,
							visible : $(this).find("keyword:contains(visible)").length!=0,
							legendIcon : theLegendIcon,
                            opacity: 10,
                            description: $(this).find('Abstract').text(),
                            cql_filter: null,
                            maxExtent: bounds.transform(Maps.projections['EPSG:3003'], Maps.projections['EPSG:900913']),
                            srs: $(this).find('SRS').text()
						};
						records[records.length]=record;
					}
				}
			});
		var storeKeys = store.loadRecords(Maps.Layer, records);
        store.dataSourceDidFetchQuery(query);
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
