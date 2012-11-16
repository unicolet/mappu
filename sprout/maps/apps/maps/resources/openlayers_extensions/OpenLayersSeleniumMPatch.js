/**
*  Mappu : yet another web gis (with social taste).
*  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
*
*  Licensed under the LGPL.
*/

/*
  The purpose of this monkey patching is to allow testing OpenLayers with Selenium.
  For a discussion see:

  http://unicolet.blogspot.it/

 */

sc_require('resources/OpenLayers');

OpenLayers.Handler.Click.prototype.mousedown=function(evt) {
     if(evt.xy && (evt.xy.x <= 0.0 && evt.xy.y <= 0.0)) {
         return true;
     }
     this.down = this.getEventInfo(evt);
     this.last = this.getEventInfo(evt);
     return true;
 };
