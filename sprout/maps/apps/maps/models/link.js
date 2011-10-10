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
Maps.Link = SC.Record.extend(
/** @scope Maps.Link.prototype */ {
	
	url: SC.Record.attr(String),
	description: SC.Record.attr(String),
	title: SC.Record.attr(String),
	layer: SC.Record.attr(String),
	layerGroup: SC.Record.attr(String),
	featureId: SC.Record.attr(String),
	enabled: SC.Record.attr(Boolean)

}) ;
