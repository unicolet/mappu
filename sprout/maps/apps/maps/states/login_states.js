/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.checkingLoginSessionState = SC.State.extend({
    enterState:function () {
        // bind spinner status
        SC.Request.manager.inflight.addObserver('[]', function (array) {
            var length = array.get('length');

            SC.run(function () {
                Maps.set('isLoading', length > 0);
            }, this);
        });

        // try to load user data from existing server session
        Maps.authenticationManager.set("content", Maps.store.find(Maps.User, Math.random()));
    },

    exitState:function () {
        // do nothing
    },

    noLoginSession:function () {
        this.gotoState("notLoggedIn");
    },

    userLoaded:function () {
        this.gotoState('loggedIn');
    }
});

Maps.notLoggedInState = SC.State.extend({
    initialSubstate:'awaitingUserInput',

    enterState:function () {
        Maps.authenticationManager.reset();
        Maps.getPath('loginPage.mainPane').append();

        // warn users running Mappu on IE 8 or lower that there might be issues
        if (SC.browser.isIE && SC.browser.compare(SC.browser.version,9)<0) {
            SC.AlertPane.warn({
                message:"_msie_unsupported".loc(),
                description:"_msie_unsupported_body".loc(),
                caption:"_msie_unsupported_caption".loc(),
                buttons:[
                    {
                        title:"OK"
                    }
                ]});
        }
    },

    exitState:function () {
    },


    awaitingUserInput:SC.State.extend({
        login:function () {
            this.gotoState('authenticatingUser');
        }
    }),

    authenticatingUser:SC.State.extend({
        enterState:function () {
            Maps.authenticationManager.attemptLogin();
        },

        loginSuccessful:function (user) {
            Maps.authenticationManager.set('content', Maps.store.find(Maps.User, user.id));
        },

        loginFailed:function (errorMessage) {
            Maps.authenticationManager.loginFailed(errorMessage);
            this.gotoState('awaitingUserInput');
        },

        userLoaded:function () {
            this.gotoState('loggedIn');
        }
    })
});

Maps.loggedInState = SC.State.extend({

    initialSubstate:'loadingWms',

    loadingWms:SC.State.extend({

        enterState:function () {
            Maps.Session.set("propertyPrefix", Maps.authenticationManager.currentUsername());

            if (!Maps.progressPane) {
                Maps.progressPane = SC.PanelPane.create({
                    layout:{ width:400, height:60, centerX:0, centerY:0 },
                    contentView:SC.View.extend({
                        childViews:"labl bar".w(),
                        labl:SC.LabelView.design({
                            layout:{top:10, centerX:0, width:100, height:30},
                            value:"_loading".loc()
                        }),
                        bar:SC.View.design({
                            layout:{top:30, centerX:0, width:350, height:20},
                            render:function (ctx, firstTime) {
                                if (firstTime) {
                                    ctx.push("<progress style=\"width:100%\"></progress>");
                                }
                                return ctx;
                            },
                            updateProgress:function (progress) {
                                var justToTriggerRefresh = 0;
                                var bar = this.$("progress");
                                if (bar && bar.length == 1) {
                                    bar = bar[0];
                                    bar.max = 100;
                                    bar.value = progress;
                                    // force refresh
                                    justToTriggerRefresh = bar.parentNode.offsetTop + "px";
                                    //@if(debug)
                                    console.log("Progress is now: " + progress);
                                    //@endif
                                } else {
                                    //@if(debug)
                                    console.log("Cannot find progress element, perhaps it is unsupported on this platform?");
                                    //@endif
                                }
                            }
                        })
                    })
                });
            }
            Maps.progressPane.append();

            var layers = Maps.openLayersController.get('tmp');
            if (layers) {
                layers.refresh();
            } else {
                layers = Maps.wmsStore.find(Maps.LAYERS_QUERY);
                Maps.openLayersController.set('tmp', layers);
            }
            //@if(debug)
            console.log("At the end of loadingWms.enterState");
            //@endif
        },

        updateProgress:function (progress) {
            Maps.progressPane.contentView.bar.updateProgress(progress);
        },

        loadingCompleted:function (data) {
            this.gotoState('viewingMap');
        },

        exitState:function () {
            // the progress pane is removed by the next state
        }
    })
});