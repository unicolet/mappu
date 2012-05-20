/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.statechart = SC.Statechart.create({
    initialState:'checkingLoginSession',

    checkingLoginSession: SC.State.plugin('Maps.checkingLoginSessionState'),

    notLoggedIn: SC.State.plugin('Maps.notLoggedInState'),

    loggedIn:SC.State.plugin('Maps.loggedInState'),

    viewingMap:SC.State.plugin('Maps.viewingMapState')

});
