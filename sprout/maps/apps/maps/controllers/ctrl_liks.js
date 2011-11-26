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

    query:null,

    findLinks: function() {
		var fa = Maps.featureInfoController.get("selection").firstObject().attributes();

        var parameters={fid: Maps.featureInfoController.get("selection").firstObject().getSocialID(), layer: fa["LAYER"], group: fa["GROUP"]};
        var query=null;

        if(WMSCONFIG.extended_link_regex) {
            parameters={
                fid: Maps.featureInfoController.get("selection").firstObject().getSocialID(),
                layer: fa["LAYER"],
                group: fa["GROUP"]};
            query=SC.Query.local(Maps.Link,
                "( ( {layer} MATCHES layerRegex AND layerGroup={group} AND featureId={fid} ) "+
                "OR ( {layer} MATCHES layerRegex AND layerGroup={group} AND featureId!={fid} ) "+
                "OR ( layerGroup={group} AND layerGroup!={group} AND featureId!={fid} ) )", parameters);
        } else {
            query=SC.Query.local(Maps.Link,
                "( ( layer={layer} AND layerGroup={group} AND featureId={fid} ) "+
                "OR ( layer={layer} AND layerGroup={group} AND featureId!={fid} ) "+
                "OR ( layerGroup={group} AND layerGroup!={group} AND featureId!={fid} ) )", parameters);
        }

        this.set("content", Maps.store.find(query) );

        // good housekeeping?
        if(this.query) {
            this.query.destroy();
        }
        this.query=query;

	}

}) ;
