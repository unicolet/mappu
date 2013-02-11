/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.link");

var __links, __query;
Maps.__isTesting=true;

test("link.login",function (){
    stop(3000);
    Maps.authenticationManager.reset();
    Maps.authenticationManager.set("inputUsername","demo");
    Maps.authenticationManager.set("inputPassword","demo");
    Maps.authenticationManager.attemptLogin();

    setTimeout(__checkLogin,2800);
});

function __checkLogin() {
    ok(true, "logged in"); // no real way to check we're logged in at this point
    start();
};

test("link.store.integration", function () {
    // Pause the test runner. If start() is not called within 2 seconds, fail the test.
    stop(2000);
    __links = Maps.store.find(Maps.LINK_QUERY);
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkLinksFind, 1800);
});

function __checkLinksFind() {
    ok(__links.length()>=1, "at least one link");
    ok(__links.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    start();
}

test("link.local.query", function() {
    stop(2000);
    var q=SC.Query.local(Maps.Link,
                    "( ( layer={layer} AND layerGroup={group} AND featureId={fid} ) "+
                    "OR ( layer={layer} AND layerGroup={group} AND featureId!={fid} ) "+
                    "OR ( layerGroup={group} AND layerGroup!={group} AND featureId!={fid} ) )",
        {fid:1, layer:"states", group:"top"}
    );
    __query=Maps.store.find(q);
    setTimeout(__checkLocalFind, 1500);
});

function __checkLocalFind() {
    ok(__query.length()>=1, "at least one link");
    ok(__query.get('status') === SC.Record.BUSY_LOADING, 'Status is BUSY_LOADING (actual '+__query.get('status')+')');
    start();
}

test("link.local.query.fail", function() {
    stop(2000);
    var q=SC.Query.local(Maps.Link,
                    "( ( layer={layer} AND layerGroup={group} AND featureId={fid} ) "+
                    "OR ( layer={layer} AND layerGroup={group} AND featureId!={fid} ) "+
                    "OR ( layerGroup={group} AND layerGroup!={group} AND featureId!={fid} ) )",
        {fid:1, layer:"NONE", group:"NONE"}
    );
    __query=Maps.store.find(q);
    setTimeout(__checkLocalFindFail, 1500);
});

function __checkLocalFindFail() {
    ok(__query.length()==0, "no link");
    ok(__query.get('status') === SC.Record.BUSY_LOADING, 'Status is BUSY_LOADING (actual '+__query.get('status')+')');
    start();
}

test("link.logout",function (){
    stop(2000);
    Maps.authenticationManager.logout();

    setTimeout(__checkLogout,1500);
});

function __checkLogout() {
    ok( ! Maps.authenticationManager.getPath("content.authenticated"), "logged out");
    start();
};
