/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.printingMapState = SC.State.extend({
    enterState: function(ctx) {
        Maps.printSheetPane.append();
    },

    exitState: function(ctx) {
        Maps.printSheetPane.remove();
    },

    installExtension: function() {
        if(SC.browser.chrome) {
            SC.AlertPane.info({
                message: "_print_chrome_title".loc(),
                description: "_print_chrome_body".loc(),
                caption: "",
                buttons: [
                    {
                    title: "_install_print_extension".loc(),
                    action: "didClickInstallPrintExtension"
                    },
                    {
                      title: "OK"
                    }
                ]});
        } else if(SC.browser.mozilla) {
            SC.AlertPane.info({
                message: "_print_mozilla_title".loc(),
                description: "_print_mozilla_body".loc(),
                caption: "",
                buttons: [
                    {
                    title: "_install_print_extension".loc(),
                    action: "didClickInstallPrintExtension"
                    },
                    {
                      title: "OK"
                    }
                ]});
        } else {
            SC.AlertPane.info({
                message: "_working_on_it".loc(),
                description: "_working_on_it".loc(),
                caption: "",
                buttons: [
                    {
                      title: "OK"
                    }
                ]});
        }
    },

    mapfishPrint: function(){
        var map=Maps.openLayersController.getOLMAP();
        var printer=new mapfish.PrintProtocol(map,printConfig);
        printer.spec.layout="A4 landscape";
        printer.spec.pages=[
                {
                    bbox: map.getExtent().toBBOX().split(","),
                    dpi: 190,
                    geodetic: false,
                    comment: Maps.printController.get("commentText"),
                    mapTitle: Maps.printController.get("title")
                }
            ];
        printer.createPDF(this.didMapfishPrint, this.didMapfishPrint, this.didMapfishPrint, this);
    },

    didMapfishPrint: function(){
        this.gotoState("browsingMapState");
    },

    didClickInstallPrintExtension: function() {
        if(SC.browser.chrome) {
            window.open(APPCONFIG.print.chrome);
        } else if(SC.browser.mozilla) {
            window.open(APPCONFIG.print.firefox);
        } else {
            window.open(APPCONFIG.print.other);
        }
    },


    close: function() {
        this.gotoState("browsingMapState");
    }
});