/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.appManagementPane = SC.PanelPane.design({
    layout:{width:800, height:300, centerX:0, centerY:0},
    contentView:SC.View.extend({
        layout:{top:5, bottom:5, left:5, right:5},
        childViews:"sourceList informational users".w(),

        sourceList:SC.SourceListView.design({
            layout:{ bottom:0, left:0, width:150, top:0 },
            contentBinding: SC.Binding.oneWay("Maps.appManagementController.sourceListTree"),
            exampleView:SC.ListItemView.extend({
                hasContentIcon:YES,
                contentIconKey: 'icon',
                contentValueKey:'name'
            }),
            value: function() {
                var sel=this.get("selection");
                var theView = "Maps.appManagementController.informational";
                if(sel && sel.firstObject()) {
                    return sel.firstObject().get("view");
                }
                return true;
            }.property("selection").cacheable(true)
        }),
        informational: SC.LabelView.design({
            layout: {centerX:0, centerY:0, width: 200, height: 30},
            value: "_please_select_an_item".loc(),
            isVisibleBinding: SC.Binding.single(".parentView.sourceList.value").bool()
        }),
        users: SC.LabelView.design({
            layout: {centerX:0, centerY:0, width: 200, height: 30},
            value: "_users_tbd".loc(),
            isVisibleBinding: SC.Binding.single(".parentView.sourceList.value").bool()
        })
    })
}).create();