// ==========================================================================
// Project:   Maps.Social
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/

Maps.Social = SC.Record.extend(
/** @scope Maps.Social.prototype */ {

	starred: SC.Record.attr(Boolean),
	tags: SC.Record.attr(String),
}) ;
