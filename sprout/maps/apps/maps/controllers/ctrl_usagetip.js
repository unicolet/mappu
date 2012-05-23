/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/*globals Maps */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Maps.usageTipController = SC.ObjectController.create(
/** @scope Maps.usageTipController.prototype */ {
     SHOW_TIPS_STORAGE_KEY: "SHOW_TIPS_STORAGE_KEY",

    /**
     * true if the user wants to see tips at startup.
     */
    showTips: YES,

    /**
     * Startup function, called by statechart.
     */
    maybeShowTips: function(force) {
        if(APPCONFIG.showTips) {
            this.readTipsSettings();

            if(this.get("showTips")||force) {
                this.showNextTip();
                Maps.usageTipSheetPane.append();
            }
        }
    },

    readTipsSettings: function() {
        if(window.localStorage) {
            if (window.localStorage[this.SHOW_TIPS_STORAGE_KEY]=="0") {
                this.set("showTips",NO);
            } else {
                this.set("showTips",YES);
            }
        }
    },

    /**
     * load and display next tip.
     */
    showNextTip: function() {
       this.set("content", Maps.store.find(Maps.UsageTip, Math.random()));
    },

    didShowTipsChange: function() {
        if(window.localStorage) {
            window.localStorage[this.SHOW_TIPS_STORAGE_KEY]= ( this.get("showTips") ? "1" : "0" );
        }
    }.observes("showTips")
}) ;
