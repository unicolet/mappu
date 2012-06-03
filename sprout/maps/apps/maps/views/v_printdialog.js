/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.printSheetPane = SC.SheetPane.design({
    layout: {width:550, height:180, centerX:0},
    contentView: SC.View.extend({
        layout: {top:10,bottom:5,left:5,right:10},
        childViews: "icon title commentLbl commentText printBtn closeBtn printExtensionBtn".w(),
        icon: SC.ImageView.design({
            layout: {left: 5, centerY:0, height:16, width:16},
            value: "icon-print-16"
        }),
        title: SC.LabelView.design({
            layout: {left: 40, right: 0, top:0, height: 24 },
            value: "_print_title".loc(),
            fontWeight: SC.BOLD_WEIGHT
        }),
        commentLbl: SC.LabelView.design({
            layout: {left: 40, right: 0, top:30, height: 24 },
            value: "_comment".loc()
        }),
        commentText: SC.TextFieldView.design({
            layout: {left: 40, right: 0, top:50, bottom: 44 },
            valueBinding: "Maps.printController.commentText",
            isTextArea: YES
        }),
        printBtn: SC.ButtonView.design({
            layout: {width: 90, right: 100, height:24, bottom: 0 },
            title: "_do_print".loc(),
            action: "mapfishPrint"
        }),
        closeBtn: SC.ButtonView.design({
            layout: {width: 90, right: 0, height:24, bottom: 0 },
            title: "_close".loc(),
            action: "close"
        }),
        printExtensionBtn: SC.ButtonView.design({
            layout: {width: 200, left: 40, height:24, bottom: 0 },
            title: "_install_print_extension".loc(),
            action: "installExtension",
            isVisible: SC.browser.isChrome,
            toolTip: "_print_chrome_body".loc()
        })
    })
}).create();