/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.Tag = SC.Record.extend(
/** @scope Maps.Tag.prototype */ {
	tag: SC.Record.attr(String),
	occurrences: SC.Record.attr(Number),
    visible: SC.Record.attr(Boolean)
}) ;
