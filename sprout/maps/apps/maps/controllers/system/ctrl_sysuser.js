/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.systemUserController = SC.ObjectController.create({
    isCreating: NO,
    isChangingPassword: NO,

    validationErrors: "",

    validate: function() {
        var user=this.get("content");
        var errors=[];
        if(user) {
            if(this.isCreating && this.userExists(user.get("username"))){
                errors.push("_user_exists".loc());
            }
            if(user.get("password") != user.get("passwordRepeat")) {
                errors.push("_pwd_not_match".loc());
            }
        }
        this.set("validationErrors",errors.join("."));
        return errors.length==0;
    },

    userExists: function(username) {
        return Maps.store.find(SC.Query.local(Maps.SysUser,"username = {username}", {'username': username})).get("length")!=0;
    }
})
