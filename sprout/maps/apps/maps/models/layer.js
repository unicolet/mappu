// ==========================================================================
// Project:   Maps.Layer
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Maps.Layer = SC.Record.extend(
/** @scope Maps.Layer.prototype */ {

	title: SC.Record.attr(String),
	name: SC.Record.attr(String),
	isVisible: SC.Record.attr(Boolean),
	legendIcon: SC.Record.attr(String),
    order: SC.Record.attr(Number)

}) ;
