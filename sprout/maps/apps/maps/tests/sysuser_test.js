/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.sysuser");

Maps.__isTesting=true;

var __users, __user=null, __nestedStore;

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

test("sysuser.nestedstore.save.integration", function () {
    stop(1200);
    __nestedStore = Maps.store.chain();
    __user = __nestedStore.find(Maps.SysUser, 1);
    SC.RunLoop.begin();
    __user.set("enabled", true);
    __nestedStore.commitChanges(NO);
    Maps.store.commitRecords();
    SC.RunLoop.end();
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUserSaveNestedStore, 1000);
});

function __checkSysUserSaveNestedStore() {
    var user=Maps.store.find(Maps.SysUser, 1);

    ok(user.get('username'), "username property is present");
    ok(user.get('enabled')!==undefined, "enabled property is present");
    ok(user.get('enabled')==true, "user is enabled");
    ok(user.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN (actual: '+__user.get('status')+')');
    start();

    if(__nestedStore) { __nestedStore.destroy(); __nestedStore=null; }
}

test("sysuser.store.create.integration", function () {
    stop(1000);
    __user = Maps.store.createRecord(
        Maps.SysUser, {
            username: "sc_tests_"+(Math.random()*100),
            enabled: true,
            password:'changeme',
            passwordRepeat: 'changeme'
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
    ok(__user.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN (actual: '+__user.get('status')+')');
    start();
    // dump on console
    console.log(__user.get('attributes'));
    __user=null;
    if(__nestedStore) { __nestedStore.destroy(); __nestedStore=null; }
}

test("sysuser.nestedstore.create.integration", function () {
    stop(1200);
    __nestedStore = Maps.store.chain();
    __user = "sc_tests_"+(Math.random()*100);
    __nestedStore.createRecord(
        Maps.SysUser,
        {
            username: __user,
            enabled: true,
            password:'changeme',
            passwordRepeat: 'changeme'
        }
    );

    SC.RunLoop.begin();
    __nestedStore.commitChanges(NO);
    Maps.store.commitRecords();
    SC.RunLoop.end();

    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkSysUserCreateNestedStore, 100);
});

function __checkSysUserCreateNestedStore() {
    var records = Maps.store.find(SC.Query.local(Maps.SysUser,"username = {username}", {username: __user}));
    var user=records.objectAt(0);
    ok(user.get('username'), "username property is present");
    ok(user.get('username')==__user, "username is "+__user);
    ok(user.get('enabled')==true, "user is enabled");
    ok(user.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN (actual: '+user.get('status')+')');
    start();
    // dump on console
    console.log(user.get('attributes'));
    __user=null;
    if(__nestedStore) { __nestedStore.destroy(); __nestedStore=null; }
}

test("sysuser.validation", function () {
    ok(Maps.systemUserController.userExists("admin"), "user admin exists");
    ok(!Maps.systemUserController.userExists("gandalf"), "user gandalf does not exist");
});