/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.SysUser = SC.Record.extend({
    username: SC.Record.attr(String),
    enabled: SC.Record.attr(Boolean),

    // used by the list view in the admin section
    icon: "sc-icon-user-16"
});
