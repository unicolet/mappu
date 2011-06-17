Maps.ClosableMixin = {
    /*
    *  This mixin expects the top right edge to hold a close-like icon
    *  like the maps-panel class does.
    */
    mouseUp: function(evt) {
        if (evt.srcElement)
            if(evt.srcElement.className.indexOf("top-right-edge")!=-1) {
                this.remove();
                return YES;
            }
    },

    touchEnd: function(touch) {
        if (touch.event) this.mouseUp(touch.event);
    }
}
