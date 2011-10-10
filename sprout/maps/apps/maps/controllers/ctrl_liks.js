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
Maps.linkController = SC.ArrayController.create(
/** @scope Maps.link.prototype */ {


    findLinks: function() {
		var fa = Maps.featureInfoController.get("selection").firstObject().attributes();
        var links=this.get('content');
		Maps.LINK_QUERY.parameters={featureId: Maps.featureInfoController.get("selection").firstObject().getSocialID(), layer: fa["LAYER"], layerGroup: fa["GROUP"]};
		if (links == null) {
			links = Maps.store.find(Maps.LINK_QUERY);
            this.set('content', links);
		} else {
			links.refresh();
		}
	}

}) ;
