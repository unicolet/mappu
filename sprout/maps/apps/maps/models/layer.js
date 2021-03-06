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

var filter_icon_url=sc_static("images/filter_icon.png");

Maps.Layer = SC.Record.extend(
/** @scope Maps.Layer.prototype */ {

	title: SC.Record.attr(String),
	name: SC.Record.attr(String),
	visible: SC.Record.attr(Boolean),
	legendIcon: SC.Record.attr(String),
    order: SC.Record.attr(Number),
    opacity: SC.Record.attr(Number),
    cql_filter: SC.Record.attr(String),
    srs: SC.Record.attr(String),

    filterIcon: function(k,v) {
        if(this.get("cql_filter")!=null) {
            return filter_icon_url;
        } else {
            return null;
        }
    }.property("cql_filter").cacheable()

}) ;
