/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.appManagementController = SC.ObjectController.create({
    sourceListTree:SC.TreeItemObserver.create({
        delegate: this,
        item:SC.Object.create(SC.TreeItemContent,{
            treeItemIsExpanded:true,
            group: false,
            treeItemChildren:[
                SC.Object.create({
                    name:'_users'.loc(),
                    icon:'sc-icon-user-16',
                    view: "users"
                })
            ]
        }),
        treeItemIsGrouped:false,
        treeItemIsExpandedKey: "treeItemIsExpanded",
        treeItemChildrenKey: "treeItemChildren"
    })
});