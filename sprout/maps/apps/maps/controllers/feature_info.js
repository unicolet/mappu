// ==========================================================================
// Project:   Maps.featureInfo
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

sc_require("views/feature");

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.featureInfoController = SC.ArrayController.create(
	SC.CollectionViewDelegate,
/** @scope Maps.featureInfo.prototype */ {
	
	toggleMarker: function(event, marker, highlightLayer) {
		highlightLayer.removeAllFeatures();
		if (marker) {
			marker.icon.setUrl(iconSelected.url);
			if (currentMarker && currentMarker != marker ) {
				currentMarker.setUrl(icon.url);
			}
			highlightLayer.addFeatures([marker.data.feature]);
		}
		highlightLayer.redraw();
		currentMarker=marker;
		/* if event is null it means we were called from SC because selection changed */
		if (event && marker) {
			OpenLayers.Event.stop(event);
			SC.RunLoop.begin();
			Maps.featureInfoController.selectObject(Maps.featureInfoController.content.objectAt(marker.data.idx));
			SC.RunLoop.end();
		}
	},
	
	toggleMarkerWhenSelectionChanges: function() {
		var highlightLayer = Maps.openLayersController.get('FEATURE_INFO_LAYER');
        var marker = null;
        if (this.get("selection").firstObject())
        	marker = Maps.openLayersController.get('MARKERS_LAYER').markers[this.indexOf(this.get("selection").firstObject())];
		this.toggleMarker(null,marker,highlightLayer);
	}.observes("selection"),
	
	findComments: function() {
		Maps.COMMENT_QUERY.parameters={social: this.get("selection").firstObject().attributes()["social"]};
		if (Maps.comments == null) {
			Maps.comments = Maps.featuresStore.find(Maps.COMMENT_QUERY);
		} else {
			Maps.comments.refresh();
		}
		
		return Maps.comments;
	},

	findLinks: function() {
		var fa = this.get("selection").firstObject().attributes();
		Maps.LINK_QUERY.parameters={featureId: fa["social"], layer: fa["LAYER"], layerGroup: fa["GROUP"]};
		if (Maps.links == null) {
			Maps.links = Maps.featuresStore.find(Maps.LINK_QUERY);
		} else {
			Maps.links.refresh();
		}
		
		return Maps.links;
	},
	
	
	feature1: null,
	feature2: null,
	
	feature1descr: "Drop here",
	feature2descr: "Drop here",
	
	feature1geom: null,
	feature2geom: null,

    operation: null,
	
	updateFeature1Desc: function() {
		if (this.get("feature1")!=null) {
			this.set("feature1descr",this.get("feature1"));
		} else {
			this.set("feature1descr","Drop here");
		}
	}.observes("feature1"),
	
	updateFeature2Desc: function() {
		if (this.get("feature2")!=null) {
			this.set("feature2descr",this.get("feature2"));
		} else {
			this.set("feature2descr","Drop here");
		}
	}.observes("feature2"),

	/**
	* Specifies that we are allowed to drag teams
	*/
	collectionViewDragDataTypes: function(view) {
		//console.log("collectionViewDragDataTypes");
		return [Maps.Feature];
	},
	
	/**
	Called by a collection view when a drag concludes to give you the option
	to provide the drag data for the drop.
	
	This method should be implemented essentially as you would implement the
	dragDataForType() if you were a drag data source.  You will never be asked
	to provide drag data for a reorder event, only for other types of data.
	
	The default implementation returns null.
	
	@param view {SC.CollectionView}
	the collection view that initiated the drag
	
	@param dataType {String} the data type to provide
	@param drag {SC.Drag} the drag object
	@returns {Object} the data object or null if the data could not be provided.
	*/
	collectionViewDragDataForType: function(view, drag, dataType) {
		//console.log("collectionViewDragDataForType");
		var ret = null;
		
		if (dataType === Maps.Feature) {
		  return this.get('selection');
		}
		
		return ret;
	}
	
}) ;
