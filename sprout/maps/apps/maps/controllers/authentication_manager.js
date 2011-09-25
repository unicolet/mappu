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

    /* called to reinitialize this object and prepare for a new session */
    reset: function() {
        this.beginPropertyChanges();
        this.set('content',null);
        this.set('message','');
        this.endPropertyChanges();
    },

    attemptLogin: function(username, password){
        if(username==password) {
            Maps.statechart.sendEvent('loginSuccessful', {id:1,'username':username});
        } else {
            Maps.statechart.sendEvent('loginFailed', "Utente o password errata");
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