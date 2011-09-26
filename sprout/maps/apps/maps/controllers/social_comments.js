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

    newCommentText: "",

    findComments: function() {
		Maps.COMMENT_QUERY.parameters={social: Maps.featureInfoController.get("selection").firstObject().getSocialID()};
        var comments=this.get("content");
		if (comments == null) {
			comments = Maps.featuresStore.find(Maps.COMMENT_QUERY);
            this.set("content",comments);
		} else {
			comments.refresh();
		}

		return Maps.comments;
	},

	collectionViewDeleteContent: function(view, content, indexes) {
		// destroy the records
		var records = indexes.map(function(idx) {return this.objectAt(idx);}, this);
		records.invoke('destroy');
		
		this.deselectObjects(this.get('selection'));
		
		this.invokeLater(function(){this.get("content").refresh()});
    },

	addComment: function() {
        if(this.get("newCommentText")=="") {
            this.content.refresh();
        } else {
            var guid = Maps.featureInfoController.get("selection").firstObject().getSocialID();

            if (guid!=null && guid!=undefined) {
                console.log("Adding comment to guid: "+guid);
                var comment = Maps.featuresStore.createRecord(Maps.Comment, {"social": guid, "text" : this.get("newCommentText")} );

                this.content.add(comment);

                this.invokeLater(function(){
                    Maps.mainPage.commentsTab.comments.contentView.computeLayout();
                    Maps.mainPage.commentsTab.comments.scrollDownPage();
                });

                this.set("newCommentText","");
            }
        }
	  },

    delComment: function() {
        var comment=this.get("selection").firstObject();
        if(comment) {
            this.content.remove(comment);
            comment.destroy();
        }
    }
});
