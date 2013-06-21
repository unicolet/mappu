/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.sysuser");

Maps.__isTesting=true;

var __users, __user=null;

test("sysuser.sanity.check", function () {
    ok(true,"sanity check");
});

test("sysuser.login",function (){
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

test("sysuser.store.fetch.integration", function () {
    stop(1000);
    __users = Maps.store.find(Maps.SYSUSER_QUERY);
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUsersFind, 800);
});

function __checkSysUsersFind() {
    ok(__users.length()>=1, "at least one user");
    ok(__users.objectAt(0).get('username'), "username property is present");
    ok(__users.objectAt(0).get('enabled')!==undefined, "enabled property is present");
    ok(__users.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    start();
}

test("sysuser.store.save.integration", function () {
    stop(1000);
    __user = __users.objectAt(0);
    SC.RunLoop.begin();
    __user.set("enabled", false);
    Maps.store.commitRecords();
    SC.RunLoop.end();
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUserSave, 800);
});

function __checkSysUserSave() {
    ok(__user.get('username'), "username property is present");
    ok(__user.get('enabled')!==undefined, "enabled property is present");
    ok(__user.get('enabled')==false, "user is not enabled");
    ok(__user.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    start();
}

test("sysuser.store.create.integration", function () {
    stop(1000);
    __user = Maps.store.createRecord(
        Maps.SysUser, {
            username: "sc_tests_"+(Math.random()*100),
            enabled: true,
            password:'changeme'
            });

    SC.RunLoop.begin();
    Maps.store.commitRecords();
    SC.RunLoop.end();

    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUserCreate, 800);
});

function __checkSysUserCreate() {
    ok(__user.get('username'), "username property is present");
    ok(__user.get('enabled')!==undefined, "enabled property is present");
    ok(__user.get('enabled')==true, "user is enabled");
    ok(__user.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    start();
}
