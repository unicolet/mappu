/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

Maps.Session = SC.Object.create({
    supportsLocalStorage: function(k,v) {
        return APPCONFIG.enableSessionSaving && window.localStorage !== null;
    }.property().cacheable(true),

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
        if(this.get("supportsLocalStorage")) {
            if(this.get("propertyPrefix")) {
                k=this.get("propertyPrefix")+k;
            }
            window.localStorage.setItem(k,v);
        }
    },

    getItem: function(k, defaultValue) {
        var v=defaultValue;
        if(this.get("supportsLocalStorage")) {
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
        if(this.get("supportsLocalStorage")) {
            var pfix=this.get("propertyPrefix");
            for(var i=(window.localStorage.length-1);i>=0;i--) {
                var key=window.localStorage.key(i);
                if(key.indexOf(pfix)===0) {
                    window.localStorage.removeItem(key);
                }
            }
        }
    }
});