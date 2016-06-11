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

  intelligentName: function() {
      var title=this.get('_LAYER_TITLE') || this.get('name');

      var nameRegex=/n[ao]me/i;
      var namRegex=/n[ao]m/i;
      var descrRegex=/descr/i;
      var theAttributes=this.attributes();
      for(var k in theAttributes) {
          if(k!=='name' && k!=='_LAYER_TITLE') {
              if(nameRegex.test(k)) {
                return title+": "+ theAttributes[k];
              }
              if(namRegex.test(k)) {
                return title+": "+ theAttributes[k];
              }
              if(descrRegex.test(k)) {
                return title+" ("+ theAttributes[k]+")";
              }
          }
      }
      // fallback to name
      return title;
  }.property("name").cacheable(true),

  isStarred: function(k,v) {
      // if the feature has no social attribute, then no use...
      if(this.attributes()["social"] && this.attributes()["social"] != undefined) {
          if ( v != undefined ) {
              // setting
              if (this.get("social") && this.getPath("social.status")!=SC.Record.ERROR) {
                  /*
                   * Here we try to prevent busy erros when the user interacts too quickly with the app, or the
                   * backend is too slow in responding.
                   * For the time being we simply drop the mid-flight update.
                   */
                  if(this.getPath("social.status") & SC.Record.READY)
                      this.get("social").set("starred", v);
              } else {
                  var social = Maps.store.createRecord(
                    Maps.Social,
                        { guid: this.attributes()["social"],
                            starred: v,
                            tags: "",
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
  },

  rightIconKey: function(k,v) {
      return "icon-zoom-inactive-16";
  }.property(),

  lonlat: function() {
      return new OpenLayers.LonLat(this.attributes()["x"], this.attributes()["y"]);
  }
}) ;
