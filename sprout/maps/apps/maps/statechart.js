/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.statechart = SC.Statechart.create({
    initialState:'checkingLoginSession',

    checkingLoginSession:SC.State.extend({
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
    }),

    notLoggedIn:SC.State.extend({
        initialSubstate:'awaitingUserInput',

        enterState:function () {
            Maps.authenticationManager.reset();
            Maps.getPath('loginPage.mainPane').append();

            if (SC.browser.msie) {
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
            Maps.getPath('loginPage.mainPane').remove();
        },


        awaitingUserInput:SC.State.extend({
            login:function (userName, password) {
                this.gotoState('authenticatingUser');
            }
        }),

        authenticatingUser:SC.State.extend({
            enterState:function (userInformation) {
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
    }),

    loggedIn:SC.State.extend({

        initialSubstate:'loadingWms',

        logout:function () {
            this.gotoState('notLoggedIn');
        },

        loadingWms:SC.State.extend({

            enterState:function () {
                if(!Maps.progressPane) {
                    Maps.progressPane = SC.PanelPane.create({
                        layout:{ width:400, height:200, centerX:0, centerY:0 },
                        contentView:SC.View.extend({
                            childViews:"labl bar".w(),
                            labl:SC.LabelView.design({
                                layout:{top:50, centerX:0, width:300, height:30},
                                value:"_loading".loc()
                            }),
                            bar:SC.View.design({
                                layout:{top:100, centerX:0, width:350, height:20},
                                render:function (ctx, firstTime) {
                                    if (firstTime) {
                                        ctx.push("<progress style=\"width:100%\"></progress>");
                                    }
                                    return ctx;
                                },
                                updateProgress:function (progress) {
                                    var justToTriggerRefresh=0;
                                    var bar = this.$("progress")[0];
                                    if(bar) {
                                        bar.max=100;
                                        bar.value = progress;
                                        // force refresh
                                        justToTriggerRefresh = bar.parentNode.offsetTop+"px";
                                        //@if(debug)
                                        console.log("Progress is now: "+progress);
                                        //@endif
                                    }
                                }
                            })
                        })
                    });
                }
                Maps.progressPane.append();

                var layers = Maps.wmsStore.find(Maps.LAYERS_QUERY);
                Maps.openLayersController.set('tmp', layers);
            },

            updateProgress: function(progress) {
                Maps.progressPane.contentView.bar.updateProgress(progress);
            },

            loadingCompleted: function() {
                this.gotoState('viewingMap');
            },

            exitState:function () {
                //Maps.progressPane.remove();
            }
        }),

        viewingMap:SC.State.extend({
            enterState:function () {
                var page = Maps.getPath('mainPage.mainPane');
                // prepare animation
                page.disableAnimation();
                page.adjust("opacity", 0).updateStyle();
                // append
                page.append();
                page.enableAnimation();
                // perform animation
                page.adjust("opacity", 1);

                SC.routes.add('zoom/:lat/:lon/:level', Maps, Maps.zoomRoute);
                SC.routes.add('find/:layer/:query', Maps, Maps.findRoute);

                Maps.openLayersController.set('content', Maps.openLayersController.get("tmp"));

                var queries = Maps.store.find(Maps.LAYERQUERY_QUERY);
                Maps.layerQueryController.set('content', queries);

                var attributes = Maps.store.find(Maps.ATTRIBUTES_QUERY);
                Maps.featureInfoAttributesController.set('content', attributes);

                // load all links from database. From now on only in-memory queries
                Maps.store.find(Maps.LINK_QUERY);

                // now start the keep session alive timer
                Maps.authenticationManager.startSessionKeepAlive();

                Maps.progressPane.remove();

                Maps.usageTipController.maybeShowTips();
            },

            exitState:function () {
                var page = Maps.getPath('mainPage.mainPane');
                // prepare animation
                page.adjust("opacity", 0);
                // append
                setTimeout(function () {
                    page.remove();
                }, 1500);

                Maps.openLayersController.set('content', null);
                Maps.authenticationManager.set('content', null);
                Maps.layerQueryController.set('content', null);
                Maps.featureInfoAttributesController.set('content', null);

                Maps.openLayersController.destroyOpenLayersMap();
                Maps.authenticationManager.stopSessionKeepAlive();
            }
        })
    })
});