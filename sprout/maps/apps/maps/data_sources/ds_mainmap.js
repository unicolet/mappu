/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

/** @class

    (Document Your Data Source Here)

 @extends SC.DataSource
 */

sc_require('models/feature');
sc_require('models/comment');
sc_require('models/link');
sc_require("models/layer_query");
sc_require("models/attribute");
sc_require("models/tag");
sc_require("models/address");
sc_require("models/sysuser");

Maps.FEATURE_QUERY = SC.Query.remote(Maps.Feature, {});
Maps.COMMENT_QUERY = SC.Query.remote(Maps.Comment, "social = {social}", {social: ""});
Maps.COMMENT_QUERY.set("isEditable", YES);
Maps.LINK_QUERY = SC.Query.remote(Maps.Link, null, {});
Maps.LAYERQUERY_QUERY = SC.Query.remote(Maps.LayerQuery, {});
Maps.ATTRIBUTES_QUERY = SC.Query.remote(Maps.Attribute, null, {id:-1});
Maps.TAGSUMMARY_QUERY = SC.Query.remote(Maps.Tag, null, {});
Maps.GEOCODE_QUERY = SC.Query.remote(Maps.Address);
Maps.SYSUSER_QUERY = SC.Query.remote(Maps.SysUser, null, {});

Maps.MapsDataSource = SC.DataSource.extend(
    /** @scope Maps.MapsDataSource.prototype */ {
        rawFeatures:[],

        fetch: function(store, query) {
            if (query.recordType === Maps.SysUser) {
                if (query.isLocal()) {
                    return YES;
                } else {
                    SC.Request.getUrl('/mapsocial/users/list')
                        .set('isJSON', YES)
                        .notify(this, 'didFetchRecords', store, query)
                        .send();
                }
                return YES;
            }
            if (query.recordType === Maps.Address) {
                //@if(debug)
                console.log("Geocoding lat,lon = "+query.parameters.lat+","+query.parameters.lon);
                //@endif
                var latlng = new google.maps.LatLng(query.parameters.lat, query.parameters.lon);
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({'latLng': latlng}, function(results, status) {
                    //@if(debug)
                    console.log("Geocoding results");
                    //@endif
                    if (status == google.maps.GeocoderStatus.OK) {
                        var records=[];
                        for(var i=0; i<results.length; i++) {
                            //@if(debug)
                            console.log("Geocoding results["+i+"]:"+results[i].formatted_address);
                            //@endif
                            records[records.length]={guid:i, 'formatted_address': results[i].formatted_address};
                        }
                        var storeKeys = store.loadRecords(Maps.Address, records);
                        store.loadQueryResults(query, storeKeys);
                    } else {
                        this.notifyError(status);
                    }
                });
                return YES;
            }
            if (query === Maps.TAGSUMMARY_QUERY) {
                var params  = "?layer="+Maps.tagsController.get("selectedLayer");
                params      = params + (Maps.tagsController.get("onlyShowMine") ? "&mine" : "");
                SC.Request.getUrl('/mapsocial/social/tagSummary'+params )
                    .set('isJSON', YES)
                    .notify(this, 'didFetchTagSummary', store, query)
                    .send();
                return YES;
            } else if (query.recordType === Maps.LayerQuery) {
                //console.log("Maps.MapsDataSource.fetch() - Maps.LayerQuery");
                SC.Request.getUrl('/mapsocial/layerQuery/?')
                    .set('isJSON', YES)
                    .notify(this, 'didFetchLayerQueries', store, query)
                    .send();
                return YES;
            } else if (query === Maps.LINK_QUERY) {
                if (query.isLocal()) {
                    return YES;
                } else {
                    //console.log("Maps.MapsDataSource.fetch() - Maps.Link for " + $.param(query.parameters));
                    SC.Request.getUrl('/mapsocial/link/?' + $.param(query.parameters))
                        .set('isJSON', YES)
                        .notify(this, 'didFetchLinks', store, query)
                        .send();
                    return YES;
                }
            }  else if (query.recordType === Maps.Link && query.isRemote()) {
                SC.Request.getUrl('/mapsocial/links/list')
                    .set('isJSON', YES)
                    .notify(this, 'didFetchLinks', store, query)
                    .send();
                return YES;
            } else if (query.recordType === Maps.Comment) {
                //console.log("Maps.MapsDataSource.fetch() - Maps.Comment for id=" + query.parameters['social']);
                SC.Request.getUrl('/mapsocial/social/' + query.parameters['social'] + '/comments')
                    .set('isJSON', YES)
                    .notify(this, 'didFetchComments', store, query)
                    .send();
                return YES;
            } else if (query.recordType === Maps.Attribute) {
                var records = this.loadFeatureAttributes(Maps.MapsDataSource.rawFeatures, store, query.parameters['id']);
                var storeKeys = store.loadRecords(Maps.Attribute, records);
                store.loadQueryResults(query, storeKeys);
                return YES;
            } else if (query.recordType === Maps.Feature) {
                var records = this.transformOLFeaturesInFeatures(Maps.MapsDataSource.rawFeatures, store);
                var storeKeys = store.loadRecords(Maps.Feature, records);
                store.loadQueryResults(query, storeKeys);

                return YES;
            }
            return NO;
        },

        didFetchRecords: function(response, store, query) {
            if (SC.ok(response)) {
                var storeKeys = store.loadRecords(query.recordType, response.get('body').content);
                store.loadQueryResults(query, storeKeys);
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        didFetchTagSummary : function(response, store, query) {
            if (SC.ok(response)) {
                var storeKeys = store.loadRecords(Maps.Tag, response.get('body').content);
                store.loadQueryResults(query, storeKeys);
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        didFetchLayerQueries : function(response, store, query) {
            if (SC.ok(response)) {
                var storeKeys = store.loadRecords(Maps.LayerQuery, response.get('body').content);
                store.loadQueryResults(query, storeKeys);
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        didFetchComments: function(response, store, query) {
            if (SC.ok(response)) {
                var storeKeys = store.loadRecords(Maps.Comment, response.get('body').content);
                if (query.isLocal()) {
                    store.dataSourceDidFetchQuery(query);
                } else {
                    // this is for remote queries
                    store.loadQueryResults(query, storeKeys);
                }
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        didFetchLinks: function(response, store, query) {
            if (SC.ok(response)) {
                var storeKeys = store.loadRecords(Maps.Link, response.get('body').content);
                if (query.isLocal()) {
                    store.dataSourceDidFetchQuery(query);
                } else {
                    // this is for remote queries
                    store.loadQueryResults(query, storeKeys);
                }
            } else {
                store.dataSourceDidErrorQuery(query, response);
                this.notifyError(response);
            }
        },

        retrieveRecord: function(store, storeKey, id) {
            //@if(debug)
            console.log("in Maps.MapsDataSource.retrieveRecord() id=" + id);
            //@endif
            var recordType = SC.Store.recordTypeFor(storeKey);
            if (recordType === Maps.Social) {
                SC.Request.getUrl('/mapsocial/social/' + id + '?alt=json').set('isJSON', YES)
                    .notify(this, this.didRetrieveRecord, {
                        store: store,
                        storeKey: storeKey
                    }).send();
                return YES;
            }
            if (recordType === Maps.UsageTip) {
                var lang=SC.Locale.currentLanguage;
                SC.Request.getUrl('/mapsocial/tips/next?language='+lang+'&alt=json').set('isJSON', YES)
                    .notify(this, this.didRetrieveRecord, {
                        store: store,
                        storeKey: storeKey
                    }).send();
                return YES;
            }
            if (recordType === Maps.User) {
                SC.Request.getUrl('/mapsocial/login/userInfo?alt=json&ienocache=' + Math.random()).set('isJSON', YES)
                    .notify(this, this.didRetrieveUser, {
                        store: store,
                        storeKey: storeKey
                    }).send();
                return YES;
            }
            return NO;
        },

        didRetrieveRecord: function(response, params) {
            var store = params.store,
                storeKey = params.storeKey;
            //@if(debug)
            console.log("Got response, is it OK? "+SC.ok(response)+" status="+response.status);
            //@endif
            if (SC.ok(response)) {
                var dataHash = response.get('body').content;
                store.dataSourceDidComplete(storeKey, dataHash);
            } else {
                store.dataSourceDidError(storeKey, response.get('body'));
                this.notifyError(response);
            }
        },

        didRetrieveUser: function(response, params) {
            var store = params.store,
                storeKey = params.storeKey;

            if (SC.ok(response)) {
                var r = null;
                if (!response.isJSON())
                    r = SC.$.parseJSON(response.get('body'));
                else
                    r = response.get('body');

                var dataHash = r;
                if (r.success) {
                    store.dataSourceDidComplete(storeKey, dataHash);
                } else {
                    store.dataSourceDidComplete(storeKey, {guid:-1, username: "anonymous", authenticated: false});
                }
            } else {
                store.dataSourceDidError(storeKey, response.get('body'));
                this.notifyError(response);
            }
        },

        createRecord: function(store, storeKey) {
            //@if(debug)
            console.log("in Maps.MapsDataSource.createRecord() for " + store.idFor(storeKey));
            //@endif
            var url = null;
            if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Attribute)) {
                // fictional record, only serves the UI
                return YES;
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Social)) {
                url = '/mapsocial/social/' + store.idFor(storeKey) + '?alt=json';
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Comment)) {
                url = '/mapsocial/comment/'
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.SysUser)) {
                url = '/mapsocial/users/'
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Link)) {
            url = '/mapsocial/links/'
        }
            if (url) {
                SC.Request.postUrl(url).set('isJSON', YES)
                    .notify(this, this.didCreateRecord, store, storeKey)
                    .send(store.readDataHash(storeKey));
                return YES;

            } else return NO;
        },

        didCreateRecord: function(response, store, storeKey) {
            //@if(debug)
            console.log("In Maps.MapsDataSource.didCreateRecord for storeKey="+storeKey);
            //@endif
            if (SC.ok(response)) {
                var dataHash = response.get('body').content;
                store.dataSourceDidComplete(storeKey, null, dataHash.guid);
            } else {
                store.dataSourceDidError(storeKey, response);
                this.notifyError(response);
            }
        },

        updateRecord: function(store, storeKey, params) {
            //console.log("in Maps.MapsDataSource.updateRecord() for " + store.idFor(storeKey));
            var url = null;
            if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Attribute)
                || SC.kindOf(store.recordTypeFor(storeKey), Maps.Feature)
                || SC.kindOf(store.recordTypeFor(storeKey), Maps.Tag)) {
                // only used in the UI
                store.dataSourceDidComplete(storeKey);
                return YES;
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Social)) {
                url = '/mapsocial/social/' + store.idFor(storeKey) + '?alt=json';
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Comment)) {
                url = '/mapsocial/comment/' + store.idFor(storeKey) + '?alt=json'
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.SysUser)) {
                url = '/mapsocial/users/' + store.idFor(storeKey) + '?alt=json'
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Link)) {
                url = '/mapsocial/links/' + store.idFor(storeKey) + '?alt=json'
            }
            if (url) {
                SC.Request.putUrl(url).set('isJSON', YES)
                    .notify(this, this.didUpdateRecord, store, storeKey)
                    .send(store.readDataHash(storeKey));
                return YES;

            } else return NO;
        },

        didUpdateRecord: function(response, store, storeKey) {
            if (SC.ok(response)) {
                var data = response.get('body');
                if (data) data = data.content; // if hash is returned; use it.
                store.dataSourceDidComplete(storeKey, data);
            } else {
                store.dataSourceDidError(storeKey);
                this.notifyError(response);
            }
        },

        destroyRecord: function(store, storeKey, params) {
            //console.log("in Maps.MapsDataSource.destroyRecord() " + store.idFor(storeKey));
            var url = null;
            if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Social)) {
                url = '/mapsocial/social/' + store.idFor(storeKey) + '?alt=json';
            } else if (SC.kindOf(store.recordTypeFor(storeKey), Maps.Comment)) {
                url = '/mapsocial/comment/' + store.idFor(storeKey) + '?alt=json'
            }
            if (url) {
                SC.Request.deleteUrl(url).set('isJSON', YES)
                    .notify(this, this.didDestroyRecord, store, storeKey)
                    .send();
                return YES;

            } else return NO;
        },

        didDestroyRecord: function(response, store, storeKey) {
            if (SC.ok(response)) {
                store.dataSourceDidDestroy(storeKey);
            } else {
                store.dataSourceDidError(storeKey);
                this.notifyError(response);
            }
        },

        loadFeatureAttributes: function(features, store, id) {
            var i = id - 1;
            var records = [];
            if (features && i >= 0 && i < features.length) {
                var attrs = features[i].data;
                var keys = [];
                for (var key in attrs) {
                    keys.push(key);
                }
                keys.sort();
                for (var j=0,l=keys.length;j<l;j++) {
                    var k=keys[j];
                    // skip Mappu internals
                    if(k != 'guid' && k!='x' && k!='y' && k!='social' && k!='GROUP' && k!='LAYER' && k!='name' && k!='_LAYER_TITLE') {
                        records[records.length] = { 'guid': i++, property: k, value: attrs[k]};
                    }
                }
            }
            return records;
        },


        transformOLFeaturesInFeatures: function(features, store) {
            var records = [];
            if (features) {
                for (var i = 0; i < features.length; i++) {
                    if(Maps.isGEOSERVER) {
                        var record = features[i].data;
                        record['guid'] = i + 1;
                        record['name'] = features[i].fid;
                        record['GROUP'] = features[i].gml.featureNSPrefix;
                        record['LAYER'] = features[i].gml.featureType;
                        var feature_id = features[i].data['ID'];
                        if(!feature_id) {
                            feature_id = features[i].data['id'];
                        }
                        if (feature_id)
                            record['social'] = features[i].gml.featureNSPrefix + ':' + features[i].gml.featureType + ':' + feature_id;
                        else
                            record['social'] = null;
                    }
                    if(Maps.isMAPSERVER) {
                        var record = features[i].data;
                        record['guid'] = i + 1;
                        record['name'] = features[i].id;
                        record['GROUP'] = ""; //TODO: fix this
                        record['LAYER'] = features[i].type;
                        var feature_id = features[i].data['ID'];
                        if(!feature_id) {
                            feature_id = features[i].data['id'];
                        }
                        if (feature_id)
                            record['social'] = "" + ':' + features[i].type + ':' + feature_id;
                        else
                            record['social'] = null;
                    }
                    records[records.length] = record;
                }
            }
            return records;
        },

        notifyError: function(response) {
            if(Maps.__isTesting) return; // do not display alert dialogs in testing mode

            var status=response;
            if(response.status) {
                // in rest 404 is used to notify of not existing records, so it's generally not an error worth notifying
                if (response.status != 404) {
                    status=response.status;
                    SC.AlertPane.warn("_query_error_title".loc(), "_query_error_detail".loc() + status, "", "OK", this);
                }
            }
        }
    });
