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

    users:'',

    /* called to reinitialize this object and prepare for a new session */
    reset: function() {
        this.beginPropertyChanges();
        this.set('content',null);
        this.set('message','');
        this.endPropertyChanges();
    },

    attemptLogin: function(username, password){
        var authQuery=SC.Query.remote(Maps.User, null,
            {
                j_username: this.get("inputUsername"),
                j_password: this.get("inputPassword")
            });
        this.set("users", Maps.featuresStore.find(authQuery));
    },

    onResponseReceived: function() {
        if(this.getPath("users.status")==SC.Record.READY) {

        }
    },

    loginFailed: function(msg) {
        this.set("inputPassword",'');
        this.set("message", msg);
    },

    /* target of login button */
    submitLogin: function() {
        Maps.statechart.sendEvent('login', this.get('inputUsername'), this.get('inputPassword'));
    }

});