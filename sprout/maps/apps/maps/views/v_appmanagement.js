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
    layout:{left:0, top:0, bottom:0, right: 400},
    contentView:SC.View.extend({
        layout:{top:5, bottom:5, left:5, right:5},
        childViews:"sourceList exit informational users links".w(),

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
            title: "_close".loc(),
            action: "exit"
        }),
        informational: SC.LabelView.design({
            layout: {centerX:0, centerY:0, width: 200, height: 30},
            value: "_please_select_an_item".loc(),
            isVisibleBinding: SC.Binding.single(".parentView.sourceList.value").equals("informational")
        }),
        users: SC.View.design({
            layout: {top:0,bottom:0,right:0,left:155},
            isVisibleBinding: SC.Binding.oneWay(".parentView.sourceList.value").equals("users"),
            childViews: "list form create save cancel changepassword errors".w(),
            list: SC.ScrollView.design({
                layout: {left:0, top:0, bottom:29, width:200 },
                contentView : SC.ListView.design({
                    layout:{top:0,bottom:0,right:0,left:0},
                    selectionBinding: "Maps.systemUsersController.selection",
                    contentBinding: "Maps.systemUsersController.arrangedObjects",
                    contentValueKey: "username",
                    hasContentIcon:YES,
                    contentIconKey: "icon",
                    actOnSelect: YES,
                    action: function(view) {
                        var sel=this.get("selection");
                        if(sel && sel.firstObject()) {
                            Maps.systemUserController.set("content", sel.firstObject());
                        } else {
                            Maps.systemUserController.set("content", null);
                        }
                    }
                })
            }),
            form: SC.FormView.design({
                layout: {left:210, top:0, bottom:30, right:0 },
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
                    isPassword: YES,
                    isEditableBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
                })),
                passwordRepeat: SC.FormView.row("_passwordrepeat:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isPassword: YES,
                    isEditableBinding: SC.Binding.or("Maps.systemUserController.isCreating", "Maps.systemUserController.isChangingPassword")
                }))
            }),
            errors: SC.LabelView.design({
                layout: {left: 210, bottom:60, width: 200, height: 70},
                valueBinding: SC.Binding.oneWay("Maps.systemUserController.validationErrors"),
                isVisibleBinding: SC.Binding.oneWay("Maps.systemUserController.validationErrors").bool(),
                icon: "sc-icon-alert-16"
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
                layout: {left:0, height:24, bottom:0, width:70 },
                title: "_create".loc(),
                action: "createUser"
            }),
            changepassword: SC.ButtonView.design({
                layout: {left:75, height:24, bottom:0, width:125 },
                title: "_changepwd".loc(),
                action: "changePassword",
                isEnabledBinding: SC.Binding.oneWay("Maps.systemUserController.content").bool()
            })
        }),
        links: SC.View.design({
            layout: {top:0,bottom:0,right:0,left:155},
            isVisibleBinding: SC.Binding.oneWay(".parentView.sourceList.value").equals("links"),
            childViews: "list form create save cancel errors edit".w(),
            list: SC.ScrollView.design({
                layout: {left:0, top:0, bottom:29, width:200 },
                contentView : SC.ListView.design({
                    layout:{top:0,bottom:0,right:0,left:0},
                    selectionBinding: "Maps.systemLinksController.selection",
                    contentBinding: "Maps.systemLinksController.arrangedObjects",
                    contentValueKey: "title",
                    actOnSelect: YES,
                    action: function(view) {
                        var sel=this.get("selection");
                        if(sel && sel.firstObject()) {
                            Maps.systemLinkController.set("content", sel.firstObject());
                        } else {
                            Maps.systemLinkController.set("content", null);
                        }
                    }
                })
            }),
            form: SC.FormView.design({
                layout: {left:210, top:0, bottom:30, right:0 },
                childViews: "title enabled layer layerGroup description url".w(),
                contentBinding: 'Maps.systemLinkController',

                title: SC.FormView.row("_Title:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
                })),
                enabled: SC.FormView.row("_Enabled:".loc(), SC.CheckboxView.design({
                  layout: {width: 150, height: 40, centerY: 0}
                })),
                layer: SC.FormView.row("_Layer:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
                })),
                layerGroup: SC.FormView.row("_LayerGroup:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
                })),
                description: SC.FormView.row("_Description:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
                })),
                url: SC.FormView.row("_Url:".loc(), SC.TextFieldView.extend({
                    layout: {height: 20, width: 150},
                    isEditableBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
                }))
            }),
            errors: SC.LabelView.design({
                layout: {left: 210, bottom:60, width: 200, height: 70},
                valueBinding: SC.Binding.from("Maps.systemLinkController.validationErrors"),
                isVisibleBinding: SC.Binding.from("Maps.systemLinkController.validationErrors").bool(),
                icon: "sc-icon-alert-16"
            }),
            cancel: SC.ButtonView.design({
                layout: {right:20, height:24, bottom:0, width:100 },
                title: "_cancel".loc(),
                action: "cancel",
                isVisibleBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
            }),
            save: SC.ButtonView.design({
                layout: {right:140, height:24, bottom:0, width:100 },
                title: "_save".loc(),
                action: "save",
                isVisibleBinding: SC.Binding.oneWay("Maps.systemLinkController.isEditing")
            }),
            edit: SC.ButtonView.design({
                layout: {right:20, height:24, bottom:0, width:100 },
                title: "_edit".loc(),
                action: "editLink",
                isVisibleBinding: SC.Binding.not("Maps.systemLinkController.isEditing")
            }),
            create: SC.ButtonView.design({
                layout: {left:0, height:24, bottom:0, width:70 },
                title: "_create".loc(),
                action: "createLink"
            })
        })
    })
}).create();