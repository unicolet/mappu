authModule=require("../modules/auth.js");

var auth=authModule.auth;

describe('Auth middleware', function () {
    it("by default allow", function () {
        var mw=auth(false,[{path:"/*",roles:[]}]);
        mw({session:{},url:"/some/path"},{},null)
            .should.equal(true);
    });
    it("by default deny", function () {
        var mw=auth(true,[{path:"/*",roles:[]}]);
        mw({session:{},url:"/some/path"},{},null)
                .should.equal(false);
    });
    it("anonymous access", function () {
        var mw=auth(true,[{path:"/**",roles:["EVERYONE"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/some/path"},{},null)
                .should.equal(true);
    });
    it("anonymous access", function () {
        var mw=auth(true,[{path:"/**",roles:["EVERYONE"]}]);
        mw( {session:{},url:"/some/path"},{},null)
                .should.equal(true);
    });
    it("exact match access", function () {
        var mw=auth(true,[{path:"/j_spring_security_check",roles:["EVERYONE"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/j_spring_security_check"},{},null)
                .should.equal(true);
    });
    it("exact match access (with GET params)", function () {
        var mw=auth(true,[{path:"/j_spring_security_check",roles:["EVERYONE"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/j_spring_security_check?param=1"},{},null)
                .should.equal(true);
    });
    it("globstar matching", function () {
        var mw=auth(true,[{path:"/*",roles:["EVERYONE"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/some/path"},{},null)
                .should.equal(false);
    });
    it("auth by role matching", function () {
        var mw=auth(true,[{path:"/**",roles:["ROBOT"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/some/path"},{},null)
                .should.equal(true);
    });
    it("auth by role matching (more than one)", function () {
        var mw=auth(true,[{path:"/**",roles:["ROBOT"]}]);
        mw( {session:{user:{roles:["ROBOT","CYBORG"]}},url:"/some/path"},{},null)
                .should.equal(true);
    });
    it("auth by role matching (the second, more than one)", function () {
        var mw=auth(true,[{path:"/**",roles:["CYBORG"]}]);
        mw( {session:{user:{roles:["ROBOT","CYBORG"]}},url:"/some/path"},{},null)
                .should.equal(true);
    });
    it("when disabled anything goes", function () {
        authModule.enable(false);
        var mw=auth(true,[{path:"/*",roles:["EVERYONE"]}]);
        mw( {session:{user:{roles:["ROBOT"]}},url:"/some/path"},{},null)
                .should.equal(true);
    });

    after(function (done) {
        authModule.enable(true);
        done();
    });
});