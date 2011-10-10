/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.authenticationManager=SC.ObjectController.create({

    /* message displayed in the login UI */
    message: '',

    /* bindings for the login form */
    inputUsername:'',
    inputPassword:'',

    content:null,

    currentUsername: function() {
        return this.getPath("content.username");
    },

    currentUserId: function() {
        return this.getPath("content.guid");
    },

    /* called to reinitialize this object and prepare for a new session */
    reset: function() {
        this.beginPropertyChanges();
        this.set('content',null);
        this.set('message','');
        this.endPropertyChanges();
    },

    attemptLogin: function(){
        SC.Request.postUrl('/mapsocial/j_spring_security_check',
            $.param({j_username: this.get("inputUsername"),j_password: this.get("inputPassword")}))
            .header('Content-Type', 'application/x-www-form-urlencoded')
            .notify(this, 'didCheckCredentials', null, null)
            .send();
    },

    didCheckCredentials: function(response, store, query) {
        if (SC.ok(response)) {
            var r = null;
            if (!response.isJSON())
                r = SC.$.parseJSON(response.get('body'));
            else
                r = response.get('body');

            if (r.success) {

                // login successful
                Maps.statechart.sendEvent('loginSuccessful', {id:r.guid});

            } else {

                // login failed
                Maps.statechart.sendEvent('loginFailed', r.error);
            }
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    whenUserLoaded: function() {
        var content=this.get("content");
        if( content && content.get("status")==SC.Record.READY_CLEAN) {
            if(this.getPath("content.authenticated")) {
                Maps.statechart.sendEvent('userLoaded');
            } else {
                // anonymous, aka not logged in
                Maps.statechart.sendEvent('noLoginSession');
            }
        }
    }.observes("content"),

    loginFailed: function(msg) {
        this.set("inputPassword",'');
        this.set("message", msg);
    },

    /* target of login button */
    submitLogin: function() {
        Maps.statechart.sendEvent('login', this.get('inputUsername'), this.get('inputPassword'));
    }

});