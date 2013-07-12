var app = require('../app')
    , http = require('support/http')
    , qs = require('querystring')
    , should = require('should');


var new_user_guid=[];

describe('Mappu Settings API', function () {

    before(function (done) {
        app.auth.enable(false);
        http.createServer(app.application, done);
    });

    after(function (done) {
        app.auth.enable(true);
        done();
    });

    it('GET /users/list should return a user list', function (done) {
        http.request()
            .get('/users/list')
            .end(function(res) {
                res.statusCode.should.equal(200);
                var users = JSON.parse(res.body).content;
                users.should.have.lengthOf(2);
                users[0].should.have.property('username','admin');
                users[0].should.have.property('enabled',true);
                users[0].should.have.property('guid',1);
                done();
            });
    });

    it('PUT /users/1 should save a user', function (done) {
        var post_data=qs.stringify({'guid':1,'name':'admin','enabled':false});
        http.request()
            .put('/users/1')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var user = JSON.parse(res.body).content;
                user.should.have.property('username','admin');
                user.should.have.property('enabled',false);
                user.should.have.property('guid',1);
                done();
            });
    });

    it('PUT /users/1 should save a user (reverse previous)', function (done) {
        var post_data=qs.stringify({'guid':1,'username':'admin','enabled':true});
        http.request()
            .put('/users/1')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var user = JSON.parse(res.body).content;
                user.should.have.property('username','admin');
                user.should.have.property('enabled',true);
                user.should.have.property('guid',1);
                done();
            });
    });

    it('POST /users/ should insert a user', function (done) {
        var post_data=qs.stringify({'guid':1,'username':'admin2','enabled':false,'password':'abcdef','passwordRepeat':'abcdef'});
        http.request()
            .post('/users/')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var user = JSON.parse(res.body).content;
                user.should.have.property('username','admin2');
                user.should.have.property('enabled',false);
                user.guid.should.be.greaterThan(2);
                new_user_guid.push(user.guid);
                done();
            });
    });

    it('PUT /users/ should update user, with password also changes password', function (done) {
        var post_data=qs.stringify({'guid':new_user_guid[0],'username':'admin2','enabled':true,password:'changeme','passwordRepeat':'abcdef'});
        http.request()
            .put('/users/'+new_user_guid[0])
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var user = JSON.parse(res.body).content;
                user.should.have.property('username','admin2');
                user.should.have.property('enabled',true);
                user.should.have.property('guid',new_user_guid[0]);
                done();
            });
    });
});
