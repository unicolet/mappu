/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.systemLinkController = SC.ObjectController.create({
    isEditing: NO,

    validationErrors: "",

    validate: function() {
        var link=this.get("content");
        var errors=[];
        return errors.length==0;
    }
})
