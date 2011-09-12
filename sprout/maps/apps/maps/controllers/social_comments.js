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

	collectionViewDeleteContent: function(view, content, indexes) {
		// destroy the records
		var records = indexes.map(function(idx) {return this.objectAt(idx);}, this);
		records.invoke('destroy');
		
		this.deselectObjects(this.get('selection'));
		
		this.invokeLater(function(){this.get("content").refresh()});
    },

	addComment: function() {
		var guid = Maps.featureInfoController.get("selection").firstObject().getSocialID();
		
		if (guid!=null && guid!=undefined) {
            console.log("Adding comment to guid: "+guid);
			var comment = Maps.featuresStore.createRecord(Maps.Comment, {"social": guid, "text" : ""} );
			this.addObject(comment);

            this.selectObject(comment);
			//var list = Maps.mainPage.getPath('commentsTab.comments.contentView');
			//var listItem = list.itemViewForContentIndex(this.length() - 1);
			//listItem.beginEditing();
		}
	 
		return YES;
	  }
});
