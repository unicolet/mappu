/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.authenticationManager = SC.ObjectController.create({

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

    isAdmin: function() {
        return this.currentUsername()==APPCONFIG.admin_user;
    }.property("content").cacheable(),

    /* called to reinitialize this object and prepare for a new session */
    reset: function() {
        this.beginPropertyChanges();
        this.set('content', null);
        this.set('message', '');
        this.endPropertyChanges();
    },

    logout: function() {
        SC.Request.getUrl('/mapsocial/logout').json()
            .notify(this, 'didLogout', null, null)
            .send();
    },

    didLogout: function(response,s,q) {
        if (SC.ok(response)) {
            this.set("inputUsername","");
            this.set("inputPassword","");
            Maps.statechart.sendEvent("didLogout",{});
        } else {
            SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + response.status, "", "OK", this);
        }
    },

    attemptLogin: function() {
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
            SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + response.status, "", "OK", this);
        }
    },

    whenUserLoaded: function() {
        var content = this.get("content");
        if (content && content.get("status") == SC.Record.READY_CLEAN) {
            if (this.getPath("content.authenticated")) {
                Maps.statechart.sendEvent('userLoaded');
            } else {
                // anonymous, aka not logged in
                Maps.statechart.sendEvent('noLoginSession');
            }
        }
    }.observes("content"),

    loginFailed: function(msg) {
        this.set("inputPassword", '');
        this.set("message", msg);
    },

    /* target of login button */
    submitLogin: function() {
        Maps.statechart.sendEvent('login');
    },

    keepAliveInterval: null,
    startSessionKeepAlive: function() {
        this.set("keepAliveInterval", setInterval(function(){ Maps.authenticationManager.keepSessionAlive()}, 60000*5)); //every 5m
    },

    stopSessionKeepAlive: function() {
        var interval=this.get("keepAliveInterval");
        if (interval)
            clearInterval(interval);
    },

    keepSessionAlive: function() {
        SC.Request.getUrl('/mapsocial/login/').set('isJSON', YES)
        .notify(this, this.didKeepSessionAlive, {}).send();
    },

    didKeepSessionAlive: function(response, params) {
        if (SC.ok(response)) {
            // do nothing
            //@if(debug)
            console.log("sessionKeepAlive: OK");
            //@endif
        } else {
            //@if(debug)
            console.log("sessionKeepAlive: must revalidate");
            //@endif
            SC.AlertPane.warn("_session_expired".loc(), "_session_expired_detail".loc() + response.status, "", "OK", this);
        }
    },

    menuPane: SC.MenuPane.create({
        layout: {width: 130},
        //itemHeight: 25,
        items: [
            { title: '_print'.loc(), icon: 'icon-print-16', keyEquivalent: 'ctrl_p', action: "print" },
            { title: '_help'.loc(), icon: 'sc-icon-help-16', keyEquivalent: 'ctrl_h', action: "helpOpen" },
            { title: '_tips'.loc(), icon: 'icon-tips-16', keyEquivalent: 'ctrl_i', action: "tipsOpen" },
            //{ isSeparator: YES },
            { title: '_logout'.loc(), icon: 'icon-logout-16', keyEquivalent: 'ctrl_shift_n', action: "logout" }
        ]
    })
});
