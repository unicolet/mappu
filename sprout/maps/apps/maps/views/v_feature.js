/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

sc_require("views/v_views");

Maps.nosocialTab=SC.View.extend({
    childViews: "icon explanation".w(),
    icon: SC.ImageView.design({
        layout: {centerY:0, left: 10, width:24, height:24},
        value: "sc-icon-alert-24"
    }),
    explanation: SC.LabelView.design({
        layout: {centerY:0, left: 54, right:10, height: 150},
        value: "_nosocial_expl".loc()
    })
});

Maps.featureView=SCTable.TableView.design({
    classNames: ["denim"],

    contentBinding: 'Maps.featureInfoAttributesController.arrangedObjects',
    selectionBinding: 'Maps.featureInfoAttributesController.selection',

    action: "onAttributeDoubleClick",
    target: "Maps.featureInfoAttributesController",

    columns: [SC.Object.create(SCTable.Column, {
        name: "_property".loc(),
        valueKey: 'property',
        width: 100,
        canSort: YES
    }),
        SC.Object.create(SCTable.Column, {
            name: "_value".loc(),
            valueKey: 'value',
            width: 170,
            canSort: YES
        })]
});

Maps.tagsTab = SC.View.design({
    classNames: ["denim"],
    childViews: "noSocialTab yesSocial".w(),
    noSocialTab: Maps.nosocialTab.design({
        layout: {top:0,bottom:0,left:0,right:0},
        isVisibleBinding: SC.Binding.oneWay('Maps.socialController.content').not()
    }),
    yesSocial: SC.View.design({
        childViews:"star tags tagsHelp saveTags".w(),
        isVisibleBinding: SC.Binding.oneWay('Maps.socialController.content').bool(),
        star: SC.LabelView.design({
            layout: {left: 10, top:15, width: 350, height: 30 },
            valueBinding: 'Maps.socialController.starredAsText'
        }),
        tags: SC.TextFieldView.design({
            isTextArea: YES,
            layout: {left: 10, top: 50, right: 10, height: 50 },
            valueBinding: 'Maps.socialController.tags',
	    hintOnFocus: NO
        }),
        tagsHelp: SC.LabelView.design({
            layout: {top: 115, left: 10, width: 300},
            value: "_howtotypetags".loc()
        }),
        saveTags: SC.ButtonView.design({
            layout: {top: 115, right: 10, width: 70, height: 24},
            title: "_save".loc(),
            action: "maps_SaveTags",
            titleMinWidth: 40
        })
    })
});

Maps.commentsTab = SC.View.design({
    classNames: ["denim"],
    childViews: "noSocialTab yesSocial".w(),
    noSocialTab: Maps.nosocialTab.design({
        layout: {top:0,bottom:0,left:0,right:0},
        isVisibleBinding: SC.Binding.oneWay('Maps.socialController.content').not()
    }),
    yesSocial: SC.View.design({
        childViews: "comments newComment addComment delComment".w(),
        isVisibleBinding: SC.Binding.oneWay('Maps.socialController.content').bool(),
        comments: SC.ScrollView.design({
            layout: {left: 10, top:15, right: 10, bottom: 50 },
            backgroundColor: 'white',
            contentView: SC.StackedView.design({
                themeName: "comments",
                showAlternatingRows: YES,
                isSelectable: YES,
                contentBinding: 'Maps.socialCommentsController.arrangedObjects',
                selectionBinding: 'Maps.socialCommentsController.selection',
                exampleView: Maps.CommentView,
                contentValueKey: "readable"
            })
        }),
        newComment: SC.TextFieldView.design({
            layout: {bottom: 10, left:10, right: 10, height: 24 },
            valueBinding: "Maps.socialCommentsController.newCommentText",
            hint: "_addcomment_tip",
	        hintOnFocus: NO
        }),
        addComment: SC.ButtonView.design({
            layout: {bottom: 10, right:45, width: 25, height: 24},
            title: "+",
            action: "maps_AddComment",
            isEnabledBinding: SC.Binding.bool().from("Maps.socialCommentsController.newCommentText"),
            tooltip: "_addcomment".loc()
        }),
        delComment: SC.ButtonView.design({
            layout: {bottom: 10, right:10, width: 25, height: 24},
            title: "-",
            action: "maps_DelComment",
            tooltip: "_delcomment".loc(),
            isEnabledBinding: SC.Binding.transform(
                function(value, binding) {
                    return (value && value.length() > 0) ? true : false;
                }).from("Maps.socialCommentsController.selection")
        })
    })
});

Maps.linksTab = SC.View.design({
    childViews: "links description".w(),
    links: SC.ScrollView.design({
        layout: {left: 0, top:0, right: 0, bottom:0},
        backgroundColor: 'white',
        contentView: SC.ListView.design({
            rowHeight: 45,
            showAlternatingRows: YES,
            isSelectable: NO,
            contentBinding: 'Maps.linkController.arrangedObjects',
            selectionBinding: 'Maps.linkController.selection',
            contentValueKey: "title",
            exampleView: Maps.LinkView
        })
    }),
    description: SC.LabelView.design({
        title: "_links".loc(),
        layout: {bottom: 10, right:10, width: 130, height: 30 }
    })
});
