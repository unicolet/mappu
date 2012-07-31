/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.social");

var __feature, starred=NO;
Maps.__isTesting=true;

test("social.sanity.check", function () {
    ok(true,"sanity check");
});

test("social.login",function (){
    stop(2000);
    Maps.authenticationManager.set("inputUsername","demo");
    Maps.authenticationManager.set("inputPassword","demo");
    Maps.authenticationManager.attemptLogin();

    setTimeout(__checkLogin,1500);
});

function __checkLogin() {
    ok(Maps.authenticationManager.get("content"), "logged in");
    start();
};

test("social.id.required",function(){
    var feature= Maps.store.createRecord(
                            Maps.Feature, {
                                name: "test"} );
    ok(!feature.get("isStarred"), "feature w/o id is not starred");

    feature= Maps.store.createRecord(
                            Maps.Feature, {
                                "social": "-1",
                                name: "test"} );
    stop(2000);

    ok(feature.get('status') === SC.Record.BUSY_CREATING, 'Status is BUSY_CREATING (actual: '+feature.get('status')+')');
    ok(!feature.get("isStarred"), "feature id -1 is not starred");
    __feature=feature;

    setTimeout(__checkStarred, 1500);
});

function __checkStarred() {
    ok(starred == __feature.get("isStarred"), "feature id -1 is not starred");
    ok("-1" == __feature.getSocialID(),"social id = -1");
    start();
}

test("social.id.integration.create",function(){
    stop(4000);
    __feature= Maps.store.createRecord(
                            Maps.Feature, {
                                social: "-1",
                                name: "test",
                                x:1,
                                y:2
                                });

    ok(!__feature.get("isStarred"), "feature id -1 is not starred");
    ok("-1" == __feature.getSocialID(),"social id = -1");
    ok(__feature.getPath('social.status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN(actual: '+__feature.getPath('social.status')+')');

    SC.RunLoop.begin();
    __feature.set("isStarred",YES);
    starred=YES;
    Maps.store.commitRecords();
    SC.RunLoop.end();
    setTimeout(__checkSocial,3500);
});

function __checkSocial() {
    ok(__feature.getPath('social.id'), "id is not null");
    ok(1 == __feature.getPath('social.x'), "x is not 1");
    ok(2 == __feature.getPath('social.y'), "y is not 2");
    ok("" == __feature.getPath('social.tags'), "tags is not empty");
    ok(starred == __feature.getPath('social.starred'), "starred is not "+starred);
    ok(__feature.getPath('social.status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN(actual: '+__feature.getPath('social.status')+')');
    start();
}

test("social.id.integration.unstar",function(){
    stop(2000);
    SC.RunLoop.begin();
    __feature.set("isStarred",NO);
    Maps.store.commitRecords();
    SC.RunLoop.end();

    starred=NO;
    setTimeout(__checkSocial,1500);
});


test("social.logout",function (){
    stop(2000);
    Maps.authenticationManager.logout();

    setTimeout(__checkLogout,1500);
});

function __checkLogout() {
    ok( ! Maps.authenticationManager.getPath("content.authenticated"), "logged out");
    start();
};
