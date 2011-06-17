// ==========================================================================
// Project:   Maps.LayerQuery
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Maps.LayerQuery = SC.Record.extend(
/** @scope Maps.LayerQuery.prototype */ {

  name: SC.Record.attr(String),
  description: SC.Record.attr(String),
  layer: SC.Record.attr(String),

  // this is the most important of all because
  // it will be used to render a form representing
  // the CQL_FILTER to be sent to the wms/wfs server
  filterString: SC.Record.attr(String)

}) ;
