/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.printController = SC.ObjectController.create({
    title: APPCONFIG.title,
    commentText: "",

    // controls the display of the 'please wait' overlay while printing
    isPrinting: false
});