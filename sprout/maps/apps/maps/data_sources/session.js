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

    setItem: function(k,v) {
        if(window.localStorage) {
            window.localStorage.setItem(k,v);
        }
    },

    getItem: function(k, defaultValue) {
        var v=null;
        if(window.localStorage) {
            v=window.localStorage.getItem(k)!==null ? window.localStorage.getItem(k) :  defaultValue;
        }
        return v;
    },

    getItemAsBoolean: function(k, defaultValue) {
        var v=null;
        if(window.localStorage) {
            v=window.localStorage.getItem(k)!==null ? window.localStorage.getItem(k) :  defaultValue;
        }
        return v=='true';
    },

    clear: function() {
        if(window.localStorage) {
            window.localStorage.clear();
        }
    }
});