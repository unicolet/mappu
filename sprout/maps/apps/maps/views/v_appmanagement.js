/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

SC.Binding.equals = function(expectedValue) {
  return this.transform(function(value, binding) {
    return ( value == expectedValue);
  }) ;
} ;

Maps.appManagementPane = SC.PanelPane.design({
    layout:{width:800, height:300, centerX:0, centerY:0},
    contentView:SC.View.extend({
        layout:{top:5, bottom:5, left:5, right:5},
        childViews:"sourceList exit informational users".w(),

        sourceList:SC.SourceListView.design({
            layout:{ bottom:29, left:0, width:150, top:0 },
            contentBinding: SC.Binding.oneWay("Maps.appManagementController.sourceListTree"),
            exampleView:SC.ListItemView.extend({
                hasContentIcon:YES,
                contentIconKey: 'icon',
                contentValueKey:'name'
            }),
            value: function() {
                var sel=this.get("selection");
                var theView = "informational";
                if(sel && sel.firstObject()) {
                    theView = sel.firstObject().get("view");
                }
                return theView;
            }.property("selection").cacheable(true)
        }),
        exit: SC.ButtonView.design({
            layout: {left:0, height:24, bottom:0, width:150 },
            title: "_exit".loc(),
            action: "exit"
        }),
        informational: SC.LabelView.design({
            layout: {centerX:0, centerY:0, width: 200, height: 30},
            value: "_please_select_an_item".loc(),
            isVisibleBinding: SC.Binding.single(".parentView.sourceList.value").equals("informational")
        }),
        users: SC.View.design({
            layout: {top:0,bottom:0,right:0,left:155},
            isVisibleBinding: SC.Binding.single(".parentView.sourceList.value").equals("users"),
            childViews: "list form create save cancel".w(),
            list: SC.ScrollView.design({
                layout: {left:0, top:0, bottom:29, width:200 },
                contentView : SC.ListView.design({
                    layout:{top:0,bottom:0,right:0,left:0},
                    selectionBinding: "Maps.systemUsersController.selection",
                    contentBinding: "Maps.systemUsersController.arrangedObjects",
                    contentValueKey: "username",
                    actOnSelect: YES,
                    action: function(view) {
                        var sel=this.get("selection");
                        if(sel && sel.firstObject()) {
                            Maps.systemUserController.set("content", sel.firstObject());
                        }
                    }
                })
            }),
            form: SC.FormView.design({
                layout: {left:205, top:0, bottom:30, right:0 },
                childViews: "username enabled password passwordRepeat".w(),
                contentBinding: 'Maps.systemUserController',

                username: SC.FormView.row("_Username:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.single("Maps.systemUserController.isCreating")
                })),
                enabled: SC.FormView.row("_Enabled:".loc(), SC.CheckboxView.design({
                  layout: {width: 150, height: 40, centerY: 0}
                })),
                password: SC.FormView.row("_password:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isVisibleBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
                })),
                passwordRepeat: SC.FormView.row("_password:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isVisibleBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
                }))
            }),
            cancel: SC.ButtonView.design({
                layout: {right:20, height:24, bottom:0, width:100 },
                title: "_cancel".loc(),
                action: "cancel",
                isVisibleBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
            }),
            save: SC.ButtonView.design({
                layout: {right:140, height:24, bottom:0, width:100 },
                title: "_save".loc(),
                action: "save",
                isVisibleBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
            }),
            create: SC.ButtonView.design({
                layout: {left:0, centerY:0, height:24, bottom:0, width:200 },
                title: "_create".loc(),
                action: "createUser"
            })
        })
    })
}).create();