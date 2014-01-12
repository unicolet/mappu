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
    isPrinting: false,

    // array of predefined available scales, as returned by mapfish-print
    scales: null,
    // the scale chosen by the user (if the boolean value 'false', then use best-fit)
    scale: null
});