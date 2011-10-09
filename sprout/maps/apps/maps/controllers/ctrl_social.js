// ==========================================================================
// Project:   Maps.socialController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.socialController = SC.ObjectController.create(
/** @scope Maps.socialController.prototype */ {
	tags: "",
	starredAsText: "",
		
	whenContentChange: function() {
		var content=this.get("content");
		if (content) {
			this.set("tags", this.getPath("content.tags"));
			if (content.get("starred")==true) {
				this.set("starredAsText","You starred this feature");
			} else {
				this.set("starredAsText","This feature has not been starred");
			}
		} else {
			this.set("starredAsText","This feature has not been starred");
			this.set("tags","");
		}
	}.observes("content"),
	
	saveTags: function(the_guid) {
		var status=this.getPath("content.status");
		if (status!=SC.Record.ERROR) {
			this.get("content").set("tags", this.get("tags"));
		} else {
			var social = Maps.store.createRecord(
				Maps.Social,
				{ guid: the_guid, tags: this.get("tags") }
				);
			this.set("content", social);
		}
	}
	
}) ;
