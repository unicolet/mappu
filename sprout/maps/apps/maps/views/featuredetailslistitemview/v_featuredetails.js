/**
*  Mappu : yet another web gis (with social taste).
*  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
*
*  Licensed under the LGPL.
*/

//noinspection JSValidateTypes
Maps.FeatureListItemView = SC.ListItemView.extend({
    /** @private in SC.ListItemView
     *
     * Overridden here to handle events on right icon
     */
    _removeRightIconActiveState:function () {
        sc_super();

        var pane = this.get('pane'),
            del = this.displayDelegate,
            target = this.getDelegateProperty('rightIconTarget', del),
            action = this.getDelegateProperty('rightIconAction', del);

        if (action && pane) {
            pane.rootResponder.sendAction(action, target, this, pane);
        }
    }
});