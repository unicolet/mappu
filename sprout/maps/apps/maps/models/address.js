/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/*
 * Represents and address as returned by the Google Maps geocoding API.
 */
Maps.Address = SC.Record.extend(
/** @scope Maps.Address.prototype */ {

	formatted_address: SC.Record.attr(String)
});
