// ==========================================================================
// Project:   Maps.socialCommentsController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.socialCommentsController = SC.ArrayController.create(
	SC.CollectionViewDelegate,
/** @scope Maps.socialCommentsController.prototype */ {
	
	isAdding: NO,
	
	collectionViewDeleteContent: function(view, content, indexes) {
		// destroy the records
		var records = indexes.map(function(idx) {return this.objectAt(idx);}, this);
		records.invoke('destroy');
		
		this.deselectObjects(this.get('selection' ));
		
		this.invokeLater(function(){this.get("content").refresh()});
    },

	addComment: function() {
		var guid = Maps.featureInfoController.get("selection").firstObject().attributes()["social"];
		
		if (guid) {
			var comment = Maps.featuresStore.createRecord(Maps.Comment, {"social": guid, "text" : ""} );
			
			this.invokeLater(function(){this.get("content").refresh()});
			this.set("isAdding",YES);
		}
	 
		return YES;
	  },
	  
	  editNewComment: function() {
	  	  if ( this.get("isAdding") && this.get("content").status == SC.Record.READY_CLEAN ) {
	  	  	this.set("isAdding",NO);  
	  	  	
			// activate inline editor once UI can repaint
			this.invokeLater(function() {
			  // select last object
			  var contentIndex = this.length() - 1;
			  this.selectObject(this.objectAt(contentIndex));
			  var list = Maps.mainPage.getPath('commentsTab.comments.contentView');
			  var listItem = list.itemViewForContentIndex(contentIndex);
			  listItem.beginEditing();
			  
			});
	  	  }
	  }.observes("*content.status")
});
