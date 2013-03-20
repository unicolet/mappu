/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.socialCommentsController = SC.ArrayController.create(
	SC.CollectionViewDelegate,
/** @scope Maps.socialCommentsController.prototype */ {

    destroyOnRemoval: YES,

    newCommentText: "",

    findComments: function(id) {
        if(id===false) return;

        //@ifdebug
        console.log("Maps.socialCommentsController.findComments for id="+id);
        //@endif

		Maps.COMMENT_QUERY.parameters={social: id};
        var comments=this.get("content");
		if (comments == null) {
            //@ifdebug
            console.log("Maps.socialCommentsController.findComments: new");
            //@endif
			comments = Maps.store.find(Maps.COMMENT_QUERY);
            this.set("content",comments);
		} else {
            //@ifdebug
            console.log("Maps.socialCommentsController.findComments: refresh");
            //@endif
			comments.refresh();
		}
	},

	addComment: function(view) {
        if(this.get("newCommentText")=="") {
            this.content.refresh();
        } else {
            var guid = Maps.featureInfoController.get("selection").firstObject().getSocialID();

            if (guid!=null && guid!=undefined) {
                //@ifdebug
                console.log("Adding comment to guid: "+guid);
                //@endif
                var comment = Maps.store.createRecord(
                    Maps.Comment, {
                        "social": guid,
                        username: Maps.authenticationManager.currentUsername(),
                        "text" : this.get("newCommentText")} );

                this.content.add(comment);

                this.invokeLater(function(){
                    view.parentView.comments.contentView.computeLayout();
                    view.parentView.comments.scrollDownPage();
                });

                this.set("newCommentText","");
            }
        }
	  },

    delComment: function(view) {
        this.removeObject(this.get("selection").firstObject());
        view.parentView.comments.contentView.reload();
    }
});
