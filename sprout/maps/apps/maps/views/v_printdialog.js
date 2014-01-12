/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.printSheetPane = SC.SheetPane.design({
    layout: {width:550, height:220, centerX:0},
    contentView: SC.View.extend({
        layout: {top:10,bottom:5,left:5,right:10},
        childViews: "icon title commentLbl commentText scaleLbl scale printBtn closeBtn printExtensionBtn workingoverlay".w(),

        workingoverlay: SC.LabelView.design({
            classNames: ["translucent"],
            layout: {left: 0, bottom:30, top:0, right:0},
            value: "_please_wait".loc(),
            fontWeight: SC.BOLD_WEIGHT,
            textAlign: SC.ALIGN_CENTER,
            isVisibleBinding: SC.Binding.oneWay("Maps.printController.isPrinting").bool()
        }),

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
            layout: {left: 40, right: 0, top:50, bottom: 84 },
            valueBinding: "Maps.printController.commentText",
            isTextArea: YES
        }),
        scaleLbl: SC.LabelView.design({
            layout: {left: 40, width: 50, height:24, bottom: 41 },
            value: "_scale".loc()
        }),
        scale: SC.SelectView.design({
            layout: {left: 95, width: 145, height:24, bottom: 44 },
            itemTitleKey: 'name',
            itemValueKey: 'value',
            itemsBinding: SC.Binding.oneWay("Maps.printController.scales"),
            valueBinding: "Maps.printController.scale"
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