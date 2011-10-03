/**
 * Created by JetBrains WebStorm.
 * User: unicoletti
 * Date: 9/21/11
 * Time: 2:53 PM
 * To change this template use File | Settings | File Templates.
 */

Maps.statechart = SC.Statechart.create({
    initialState: 'checkingLoginSession',

    checkingLoginSession: SC.State.extend({
        enterState: function() {
            // try to load user data from existing server session
            console.log("Checking server-side session");
            Maps.authenticationManager.set("content",Maps.featuresStore.find(Maps.User, Math.random()));
        },

        exitState: function() {
            // do nothing
        },

        noLoginSession: function() {
            this.gotoState("notLoggedIn");
        },

        userLoaded: function() {
            console.log("in userLoaded");
            this.gotoState('loggedIn');
        }
    }),

    notLoggedIn: SC.State.extend({
        initialSubstate: 'awaitingUserInput',

        enterState: function() {
            Maps.authenticationManager.reset();
            Maps.getPath('loginPage.mainPane').append();
        },

        exitState: function() {
            Maps.getPath('loginPage.mainPane').remove();
        },


        awaitingUserInput: SC.State.extend({
            login: function(userName, password) {
                this.gotoState('authenticatingUser');
            }
        }),

        authenticatingUser: SC.State.extend({
            enterState: function(userInformation) {
                Maps.authenticationManager.attemptLogin();
            },

            loginSuccessful: function(user) {
                Maps.authenticationManager.set('content', Maps.featuresStore.find(Maps.User, user.id));
            },

            loginFailed: function(errorMessage) {
                Maps.authenticationManager.loginFailed(errorMessage);
                this.gotoState('awaitingUserInput');
            },

            userLoaded: function() {
                console.log("in userLoaded");
                this.gotoState('loggedIn');
            }
        })
    }),

    loggedIn: SC.State.extend({

        initialSubstate: 'viewingMap',

        logout: function() {
            this.gotoState('notLoggedIn');
        },

        viewingMap: SC.State.extend({
            enterState: function() {
                Maps.getPath('mainPage.mainPane').append();

                var layers = Maps.store.find(Maps.LAYERS_QUERY);
                Maps.openLayersController.set('content', layers);

                var queries = Maps.featuresStore.find(Maps.LAYERQUERY_QUERY);
                Maps.layerQueryController.set('content', queries);

                var attributes = Maps.featuresStore.find(Maps.ATTRIBUTES_QUERY);
                Maps.featureInfoAttributesController.set('content', attributes);
            },

            exitState: function() {
                Maps.getPath('mainPage.mainPane').remove();
                
                Maps.openLayersController.set('content', null);
                Maps.layerQueryController.set('content', null);
                Maps.featureInfoAttributesController.set('content', null);

                Maps.openLayersController.destroyOpenLayersMap();
            }
        })
    })
});