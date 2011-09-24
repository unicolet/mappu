// ==========================================================================
// Project:   Maps.LayerDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
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
	console.log('in didFetchLayers');
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
                //console.log('layer n.'+index);
				// saltiamo il primo layer 'contenitore'
				// e il layer posticcio blank
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
                            maxExtent: bounds.transform(Maps.gaussBoagaProj, Maps.googleProj)
						};
						records[records.length]=record;
					}
				}
			});
		var storeKeys = store.loadRecords(Maps.Layer, records);
        store.dataSourceDidFetchQuery(query);
	} else {
        console.log('response has errors');
		store.dataSourceDidErrorQuery(query, response);
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
  }
  
}) ;
