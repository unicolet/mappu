/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

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
      // if the feature has no social attribute, then no use...
      if(this.attributes()["social"] && this.attributes()["social"] != undefined) {
          if ( v != undefined ) {
              // setting
              if (this.get("social") && this.getPath("social.status")!=SC.Record.ERROR) {
                  this.get("social").set("starred", v);
              } else {
                  var social = Maps.store.createRecord(
                    Maps.Social,
                        { guid: this.attributes()["social"],
                            starred: v,
                            x: this.attributes()["x"],
                            y: this.attributes()["y"]
                        });
                  this.set("social", social);
              }
          } else {
              // getting
              var starred = this.getPath("social.starred");
              return starred ? YES : NO;
          }
      }
  }.property('social'),
  
  /* hack to notify the view when the relation has ended loading */
  whenSocialLoaded: function() {
  	  if (this.getPath('social.status')==SC.Record.READY_CLEAN)
  	  	  this.notifyPropertyChange('isStarred', this.get('isStarred'));
  }.observes('*social.status'),

  getSocialID: function() {
      return this.attributes()['social'];
  }
}) ;
