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

Maps.LAYERS_QUERY = SC.Query.remote(Maps.Layer, {orderBy: 'name,visible'});

Maps.LayerDataSource = SC.DataSource.extend(
/** @scope Maps.LayerDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {

	if (query === Maps.LAYERS_QUERY ) {
	  SC.Request.getUrl('/geoserver/wms?service=WMS&version=1.1.0&request=GetCapabilities')
	  .notify(this, 'didFetchLayers', store, query)
	  .send();
	  return YES;
	}
    return NO ; // return YES if you handled the query
  },
  
  didFetchLayers: function(response, store, query) {
	//alert('in didFetchLayers');
	if (SC.ok(response)) {
		var records = [];
		var content = response.get('body');
		// XMLDocument in Firefox, null in Chrome?
		SC.$('Layer', content).each(
			function(index) {
				// saltiamo il primo layer 'contenitore'
				// e il layer posticcio blank
				if ( index!=0 && SC.$(this).attr('queryable')!="0" ) {
					var theName = $(this).find('Name').text();
					if (theName!="blank:blank") {
						var theLegendIcon = $(this.getElementsByTagName('Style')[0].innerHTML).find("OnlineResource").attr('xlink:href');
						console.log(theName + "'s icon " + theLegendIcon);
						var record={
							guid: index,
							name: theName,
							isVisible : $(this).find("keyword:contains(visible)").length!=0,
							legendIcon : theLegendIcon
						};
						//records[index-1]=record;
						records[records.length]=record;
					}
				}
			});
		var storeKeys = store.loadRecords(Maps.Layer, records);
		store.loadQueryResults(query, storeKeys);
	} else {
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
	  Maps.openLayersController.toggleLayer(dataHash['name'], dataHash['isVisible']);
	  store.dataSourceDidComplete(storeKey, null) ;
      return YES ;
  },
  
  destroyRecord: function(store, storeKey) {
    return YES ;
  }
  
}) ;
