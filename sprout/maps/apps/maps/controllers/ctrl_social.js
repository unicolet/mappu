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
Maps.socialController = SC.ObjectController.create(
/** @scope Maps.socialController.prototype */ {
	tags: "",
	starredAsText: "",
		
	whenContentChange: function() {
		var content=this.get("content");
		if (content) {
			this.set("tags", this.getPath("content.tags"));
			if (content.get("starred")==true) {
				this.set("starredAsText","_starred".loc());
			} else {
				this.set("starredAsText","_not_starred".loc());
			}
		} else {
			this.set("starredAsText","_not_starred".loc());
			this.set("tags","");
		}
	}.observes("content"),
	
	saveTags: function(feature) {
		//@if(debug)
		console.log("Saving feature tags: "+this.get("tags"));
		//@endif
		var status=this.getPath("content.status");
		if (status!=SC.Record.ERROR) {
			this.get("content").set("tags", this.get("tags"));
		} else {
			var social = Maps.store.createRecord(
				Maps.Social,
				{
                    guid: feature.attributes()["social"],
                    tags: this.get("tags"),
                    starred: false,
                    x: feature.attributes()["x"],
                    y: feature.attributes()["y"]
                }
				);
			this.set("content", social);
		}
	}
	
}) ;
