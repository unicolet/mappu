/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.comment");

var __comment, __comments, __ns;
Maps.__isTesting=true;

test("comment.readable.property", function () {
    /* note that we are passing the store to create, or the get(readable) later on will error. */
    __comment=Maps.Comment.create({store: Maps.store, "social":"-1",username:"test","text":"the text"});
    equals(__comment.get("readable"), "[test] poco fa: the text", "readable text check");
});

test("comment.login",function (){
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

test("comment.store.integration", function () {
    // Pause the test runner. If start() is not called within 2 seconds, fail the test.
    stop(2000);
    __comment = Maps.store.createRecord(
                        Maps.Comment, {
                            "social": "-1",
                            "username": "test",
                            "text" : "this is a test"} );
    ok(__comment.get('status') === SC.Record.READY_NEW, 'Status is READY_NEW');
    // Commit changes
    Maps.store.commitRecords();
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkCommentCreate, 1500);
});

function __checkCommentCreate() {
    ok(__comment.get('id'), "id is not null ("+__comment.get('id')+","+__comment.get('text')+")");
    ok(__comment.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    start();

    if(__ns) { __ns.destroy(); __ns = null; }
}

test("comment.store.integration.find", function () {
    // Pause the test runner. If start() is not called within 2 seconds, fail the test.
    stop(2000);
    Maps.COMMENT_QUERY.parameters={social: "-1"};
    __comments = Maps.store.find(Maps.COMMENT_QUERY);

    // Give our store time to find the comments
    setTimeout(__checkCommentsFind, 1800);
});

function __checkCommentsFind() {
    ok(__comments.length() >= 1, 'At least 1 comment, found: '+__comments.length());
    start();
}

test("comment.store.integration.find.none", function () {
    // Pause the test runner. If start() is not called within 2 seconds, fail the test.
    stop(2000);
    Maps.COMMENT_QUERY.parameters={social: -99};
    __comments.refresh();

    // Give our store time to find the comments
    setTimeout(__checkCommentsFindNone, 1500);
});

function __checkCommentsFindNone() {
    ok(__comments.length() == 0 , 'No comments with that id');
    start();
}

test("comment.store.integration.delete", function () {
    // Pause the test runner. If start() is not called within 2 seconds, fail the test.
    stop(2000);
    ok(__comment.get('status') === SC.Record.READY_CLEAN, 'Status is READY_CLEAN');
    __comment.destroy();
    // Commit changes
    Maps.store.commitRecords();
    // Give our store 1 second to commit records to the remote server
    setTimeout(__checkCommentDestroy, 1500);
});

function __checkCommentDestroy() {
    ok(__comment.get('status') === SC.Record.DESTROYED_CLEAN, 'Status is DESTROYED_CLEAN');
    start();
}

test("comment.logout",function (){
    stop(2000);
    Maps.authenticationManager.logout();

    setTimeout(__checkLogout,1500);
});

function __checkLogout() {
    ok( ! Maps.authenticationManager.getPath("content.authenticated"), "logged out");
    start();
};
