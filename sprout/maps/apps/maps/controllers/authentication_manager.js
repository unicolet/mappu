/**
 * Created by JetBrains WebStorm.
 * User: unicoletti
 * Date: 9/25/11
 * Time: 9:55 AM
 * To change this template use File | Settings | File Templates.
 */
Maps.authenticationManager=SC.ObjectController.create({

    /* message displayed in the login UI */
    message: '',

    /* bindings for the login form */
    inputUsername:'',
    inputPassword:'',

    content:null,

    currentUsername: function() {
        return this.content.username;
    },

    currentUserId: function() {
        this.content.id;
    },

    /* called to reinitialize this object and prepare for a new session */
    reset: function() {
        this.beginPropertyChanges();
        this.set('content',null);
        this.set('message','');
        this.endPropertyChanges();
    },

    attemptLogin: function(){
        var authQuery=SC.Query.remote(Maps.User, null,
            {
                j_username: this.get("inputUsername"),
                j_password: this.get("inputPassword")
            });
        Maps.featuresStore.find(authQuery);
    },

    whenLoggedIn: function() {
        console.log("in whenLoggedIn: "+this.get("content"));
        var content=this.get("content");
        if( content && content.get("status")==SC.Record.READY_CLEAN) {
            console.log("User has been loaded");
            if(this.getPath("content.authenticated")) {
                console.log("User is authenticated");
                Maps.statechart.sendEvent('userLoaded');
            } else {
                console.log("User is NOT authenticated");
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