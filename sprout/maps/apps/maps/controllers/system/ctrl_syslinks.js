/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.systemLinksController = SC.ArrayController.create({
    load: function() {
        var links = this.get("content");
        if (!links) {
            this.set("content", Maps.store.find(SC.Query.remote(Maps.Link, null, {})));
        } else {
            links.refresh();
        }
    }
})
