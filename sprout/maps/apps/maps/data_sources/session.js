/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.Session = SC.Object.create({
    supportsLocalStorage: function(k,v) {
        return window.localStorage !== null;
    }.property(),

    _prefix:null,

    propertyPrefix: function(k,v) {
        if(v!=undefined) {
            // setting
            this.set("_prefix",v+".");
        } else {
            // getting
            return this.get("_prefix");
        }
    }.property(),

    setItem: function(k,v) {
        if(window.localStorage) {
            if(this.get("propertyPrefix")) {
                k=this.get("propertyPrefix")+k;
            }
            window.localStorage.setItem(k,v);
        }
    },

    getItem: function(k, defaultValue) {
        var v=null;
        if(window.localStorage) {
            if(this.get("propertyPrefix")) {
                k=this.get("propertyPrefix")+k;
            }
            v=window.localStorage.getItem(k)!==null ? window.localStorage.getItem(k) :  defaultValue;
        }
        return v;
    },

    getItemAsBoolean: function(k, defaultValue) {
        return this.getItem(k)=='true';
    },

    /* TODO: clear only values owned by this module */
    clear: function() {
        if(window.localStorage) {
            window.localStorage.clear();
        }
    }
});