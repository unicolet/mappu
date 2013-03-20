var app = require('../app')
    , http = require('support/http')
    , crypto = require('crypto')
    , qs = require('querystring');


describe('Password encryption', function () {
    it("admin01 should return ...", function () {
        crypto.createHash("sha256")
            .update("admin01")
            .digest('hex')
            .should.equal('0876dfca6d6fedf99b2ab87b6e2fed4bd4051ede78a8a9135b500b2e94d99b88');
    });
});

/* global used to store cookies */
var cookies=[];

describe('User API', function () {

    before(function (done) {
        http.createServer(app.application, done);
    });

    it('POST /j_spring_security_check without params should return 200', function (done) {
        http.request()
            .post('/j_spring_security_check')
            .expect(200, done);
    });

    it('POST /j_spring_security_check without params should return {success:false,content:[]}', function (done) {
        http.request()
            .post('/j_spring_security_check')
            .expect("{\"success\":false,\"content\":[]}", done);
    });

    it('POST /j_spring_security_check with wrong params should return {success:false,content:[]}', function (done) {
        var post_data=qs.stringify({"j_username":"admin","j_password":"admin"});
        http.request()
            .post('/j_spring_security_check')
	        .set('Content-Type','application/x-www-form-urlencoded')
	        .set('Content-length',post_data.length)
            .write(post_data)
            .expect("{\"success\":false,\"guid\":\"\"}", done);
    });

    it('POST /j_spring_security_check with correct params should return {success:true,content:[username:admin]}', function (done) {
        var post_data=qs.stringify({"j_username":"admin","j_password":"admin01"});
        http.request()
            .post('/j_spring_security_check')
	        .set('Content-Type','application/x-www-form-urlencoded')
	        .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.headers.should.have.property('set-cookie');
                // parse cookies for subsequent tests
                for(var i= 0, l=res.headers['set-cookie'].length;i<l;i++) {
                    var cookie = res.headers['set-cookie'][i].split(";").shift()
                    cookies.push(cookie);
                }
                res.body.should.equal("{\"success\":true,\"guid\":\"admin\"}");
                cookies.length.should.be.above(0);
                done();
            });
    });

    it('GET /userInfo W/O cookies should return {error:"Not authenticated"}', function (done) {
        http.request()
            .get('/login/userInfo')
            .expect("{\"error\":\"Not authenticated\"}", done);
    });

    it('GET /userInfo with cookies should return success', function (done) {
        var r = http.request()
            .get('/login/userInfo');
        for(var i= 0, l=cookies.length;i<l;i++) {
            r.set('cookie',cookies[i]);
        }
        r.expect("{\"success\":true,\"guid\":\"admin\",\"username\":\"admin\",\"authenticated\":true}", done);
        // clear cookies
        cookies=[];
    });
});
