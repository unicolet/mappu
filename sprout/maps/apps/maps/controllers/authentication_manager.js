
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
        var authQuery=SC.Query.remote(Maps.User, null,
            {
                j_username: this.get("inputUsername"),
                j_password: this.get("inputPassword")
            });
        Maps.featuresStore.find(authQuery);
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