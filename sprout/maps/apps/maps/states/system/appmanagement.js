/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.appManagementState = SC.State.extend({
    enterState:function () {
        //@if(debug)
        console.log("*** appManagementState.enter ***");
        //@endif
        if (!SC.browser.isIE) {
            // prepare animation
            Maps.appManagementPane.adjust("opacity", 0);
            // append
            Maps.appManagementPane.append();
            // perform animation
            Maps.appManagementPane.animate({opacity:1}, 0.5);
        } else {
            Maps.appManagementPane.append();
        }
    },

    exitState:function () {
        //@if(debug)
        console.log("*** appManagementState.exit ***");
        //@endif
        Maps.appManagementPane.remove();
    }
});
