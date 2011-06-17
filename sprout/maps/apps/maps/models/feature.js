// ==========================================================================
// Project:   Maps.Feature
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Maps.Feature = SC.Record.extend(
/** @scope Maps.Feature.prototype */ {
  social: SC.Record.toOne("Maps.Social", { 
  		  isMaster: NO
  }),

  name: SC.Record.attr(String),

  isStarred: function(k,v) {
  	  if ( v != undefined ) {
  	  	  // setting
  	  	  if (this.getPath("social.status")!=SC.Record.ERROR) {
  	  	  	  this.get("social").set("starred", v);
  	  	  } else {
			  var social = Maps.featuresStore.createRecord(Maps.Social, { guid: this.attributes()["social"], starred: v });
			  this.set("social", social);
  	  	  }
  	  } else {
  	  	  // getting
		  var starred = this.getPath("social.starred");
		  return starred ? YES : NO;
	  }
  }.property('social'),
  
  /* hack to notify the view when the relation has ended loading */
  whenSocialLoaded: function() {
  	  if (this.getPath('social.status')==SC.Record.READY_CLEAN)
  	  	  this.notifyPropertyChange('isStarred', this.get('isStarred'));
  }.observes('*social.status')
}) ;
