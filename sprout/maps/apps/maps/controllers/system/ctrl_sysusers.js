/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.systemUsersController = SC.ArrayController.create({
    load: function() {
        var users = this.get("content");
        if (!users) {
            this.set("content", Maps.store.find(Maps.SYSUSER_QUERY));
        } else {
            users.refresh();
        }
    }
})
