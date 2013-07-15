/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.syslink");

Maps.__isTesting=true;

var __link=null, __nestedStore, __layer;

test("syslink.sanity.check", function () {
    ok(true,"sanity check");
});

test("syslink.login",function (){
    stop(3000);
    Maps.authenticationManager.reset();
    Maps.authenticationManager.set("inputUsername","admin");
    Maps.authenticationManager.set("inputPassword","admin01");
    Maps.authenticationManager.attemptLogin();

    setTimeout(__checkLogin,2800);
});

function __checkLogin() {
    ok(true, "logged in"); // no real way to check we're logged in at this point
    start();
};

test("syslink.store.create.integration", function () {
    stop(1000);
    __link = Maps.store.createRecord(
        Maps.Link, {
            layer: 'my_states',
            enabled: true,
            layerGroup:'topp',
            title: 'google me!',
            url: 'http://www.google.com/?q={{attr}}',
            description: 'really?'
            });

    SC.RunLoop.begin();
    Maps.store.commitRecords();
    SC.RunLoop.end();

    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysLinkCreate, 800);
});

function __checkSysLinkCreate() {
    ok(__link.get('layer')=='my_states', "username property is present and set to 'my_states'");
    ok(__link.get('enabled')!==undefined, "enabled property is present");
    ok(__link.get('enabled')==true, "user is enabled");
    ok(__link.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN (actual: '+__link.get('status')+')');
    start();
    // dump on console
    console.log(__link.get('attributes'));
    __link=null;
    if(__nestedStore) { __nestedStore.destroy(); __nestedStore=null; }
}

test("syslink.nestedstore.create.integration", function () {
    stop(1200);
    __nestedStore = Maps.store.chain();
    __layer = "sc_tests_"+(Math.random()*100);
    __nestedStore.createRecord(
        Maps.Link, {
            layer: __layer,
            enabled: true,
            layerGroup:'topp',
            title: 'google me!',
            url: 'http://www.google.com/?q={{attr}}',
            description: 'really?'
        });

    SC.RunLoop.begin();
    __nestedStore.commitChanges(NO);
    Maps.store.commitRecords();
    SC.RunLoop.end();

    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUserCreateNestedStore, 100);
});

function __checkSysUserCreateNestedStore() {
    var records = Maps.store.find(SC.Query.local(Maps.Link,"layer = {layer}", {layer: __layer}));
    var link=records.objectAt(0);
    ok(link.get('layer'), "layer property is present");
    ok(link.get('layer')==__layer, "layer is "+__layer);
    ok(link.get('enabled')==true, "link is enabled");
    ok(link.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN (actual: '+link.get('status')+')');
    start();
    // dump on console
    console.log(link.get('attributes'));
    __link=null;
    if(__nestedStore) { __nestedStore.destroy(); __nestedStore=null; }
}
