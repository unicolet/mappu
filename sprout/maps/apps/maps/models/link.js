// ==========================================================================
// Project:   Maps.Link
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
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
