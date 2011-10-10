/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

Maps.statechart = SC.Statechart.create({
    initialState: 'checkingLoginSession',

    checkingLoginSession: SC.State.extend({
        enterState: function() {
            // try to load user data from existing server session
            Maps.authenticationManager.set("content",Maps.store.find(Maps.User, Math.random()));
        },

        exitState: function() {
            // do nothing
        },

        noLoginSession: function() {
            this.gotoState("notLoggedIn");
        },

        userLoaded: function() {
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
                Maps.authenticationManager.set('content', Maps.store.find(Maps.User, user.id));
            },

            loginFailed: function(errorMessage) {
                Maps.authenticationManager.loginFailed(errorMessage);
                this.gotoState('awaitingUserInput');
            },

            userLoaded: function() {
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
                var page=Maps.getPath('mainPage.mainPane');
                // prepare animation
                page.disableAnimation();
                page.adjust("opacity", 0).updateStyle();
                // append
                page.append();
                page.enableAnimation();
                // perform animation
                page.adjust("opacity", 1);

                var layers = Maps.wmsStore.find(Maps.LAYERS_QUERY);
                Maps.openLayersController.set('content', layers);

                var queries = Maps.store.find(Maps.LAYERQUERY_QUERY);
                Maps.layerQueryController.set('content', queries);

                var attributes = Maps.store.find(Maps.ATTRIBUTES_QUERY);
                Maps.featureInfoAttributesController.set('content', attributes);
            },

            exitState: function() {
                var page=Maps.getPath('mainPage.mainPane');
                // prepare animation
                page.adjust("opacity", 0);
                // append
                setTimeout(function(){page.remove();},1500);

                Maps.openLayersController.set('content', null);
                Maps.layerQueryController.set('content', null);
                Maps.featureInfoAttributesController.set('content', null);

                Maps.openLayersController.destroyOpenLayersMap();
            }
        })
    })
});