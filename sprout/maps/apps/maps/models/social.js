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

Maps.Social = SC.Record.extend(
/** @scope Maps.Social.prototype */ {

	starred: SC.Record.attr(Boolean),
	tags: SC.Record.attr(String),
    x: SC.Record.attr(Number),
    y: SC.Record.attr(Number)
}) ;
