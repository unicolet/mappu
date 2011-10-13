/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
/*globals Maps */

sc_require("views/v_feature");

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
		var highlightLayer = Maps.openLayersController.getFeatureInfoLayer();
        var marker = null;
        if (this.get("selection").firstObject())
        	marker = Maps.openLayersController.getMarkersLayer().markers[this.indexOf(this.get("selection").firstObject())];
		this.toggleMarker(null,marker,highlightLayer);
	}.observes("selection"),
	
	feature1: null,
	feature2: null,
	
	feature1descr: "_drop_here".loc(),
	feature2descr: "_drop_here".loc(),
	
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
