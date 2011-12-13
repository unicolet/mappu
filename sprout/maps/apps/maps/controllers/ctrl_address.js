/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
Maps.addressController = SC.ArrayController.create({
    findAddresses: function(lat, lon) {
        Maps.GEOCODE_QUERY.parameters={
            'lat': lat,
            'lon': lon
        };

        var addresses=this.get("content");
		if (addresses == null) {
			Maps.addressController.set("content",Maps.store.find(Maps.GEOCODE_QUERY));
		} else {
			addresses.refresh();
		}
    }
});