/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.Theme = SC.AceTheme.create({
  name: 'maps'
});

SC.Theme.addTheme(Maps.Theme);

SC.defaultTheme = 'maps';

Maps.Theme.Comment = Maps.Theme.subtheme('comments');
Maps.Theme.LoginPane = Maps.Theme.subtheme('loginPane');

