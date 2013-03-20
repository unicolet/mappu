var app = require('../app')
    , http = require('support/http')
    , qs = require('querystring');


var new_comment_guid=[];

describe('Mappu API', function () {

    before(function (done) {
        app.auth.enable(false);
        http.createServer(app.application, done);
    });

    after(function (done) {
        app.auth.enable(true);
        done();
    });

    it('GET /layerQuery without params should return 200', function (done) {
        http.request()
            .get('/layerQuery')
            .expect(200, done);
    });

    it('GET /layerQuery without params should return a list', function (done) {
        http.request()
            .get('/layerQuery')
            .expect("{\"content\":[]}", done);
    });

    it('GET /link without params should return 200', function (done) {
        http.request()
            .get('/link')
            .expect(200, done);
    });

    it('GET /link without params should return a list', function (done) {
        http.request()
            .get('/link')
            .expect("{\"content\":[]}", done);
    });

    it('GET /social/topp:states:1 returns one item', function (done) {
        http.request()
            .get('/social/topp:states:1')
            .expect("{\"content\":{\"guid\":\"topp:states:1\",\"tags\":\"alpha,tango\",\"username\":\"demo\",\"starred\":true,\"x\":10.5,\"y\":20.4}}", done);
    });

    it('GET /social/topp:states:0 returns zero items', function (done) {
        http.request()
            .get('/social/topp:states:0')
            .expect("{\"content\":{}}", done);
    });

    it('GET /social/topp:states:0 returns 404', function (done) {
        http.request()
            .get('/social/topp:states:0')
            .expect(404, done);
    });

    it('POST /social/topp:states:2 should insert', function (done) {
        var post_data=qs.stringify({"x":"1","y":"2","tags":"a,b,c","starred":true});
        http.request()
            .post('/social/topp:states:2')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.body.should.equal("{\"content\":{\"guid\":\"topp:states:2\",\"tags\":\"a,b,c\",\"username\":\"admin\",\"starred\":true,\"x\":1,\"y\":2}}");
                done();
            });
    });

    it('POST /social/topp:states:2 should update', function (done) {
        var post_data=qs.stringify({"x":"1.5","y":"2.4","tags":"a,b,c","starred":true});
        http.request()
            .post('/social/topp:states:2')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.body.should.equal("{\"content\":{\"guid\":\"topp:states:2\",\"tags\":\"a,b,c\",\"username\":\"admin\",\"starred\":true,\"x\":1.5,\"y\":2.4}}");
                done();
            });
    });

    it('GET /social/topp:states:2/comments should return 200', function (done) {
        http.request()
            .get('/social/topp:states:2/comments')
            .expect(200, done);
    });

    it('GET /social/topp:states:1/comments should return 200 and a comment', function (done) {
        http.request()
            .get('/social/topp:states:1/comments')
            .expect("{\"content\":[{\"guid\":1,\"text\":\"this is the comment text\",\"social\":\"topp:states:1\",\"username\":\"demo\",\"dateCreated\":\"2012-11-11T01:02:30+01:00\",\"lastUpdated\":\"2012-11-11T01:02:30+01:00\"}]}", done);
    });

    it('POST /comment/ should return 200', function (done) {
        var post_data='{ "text": "some text", "social":"topp:states:4" }';
        http.request()
            .post('/comment/')
            .set('Content-Type','application/json')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var newComment = JSON.parse(res.body).content;
                newComment.text.should.equal("some text");
                newComment.social.should.equal("topp:states:4");
                newComment.username.should.equal("demo");
                // to be used in next test
                new_comment_guid.push(newComment.guid);
                newComment.guid.should.be.above(1);
                new_comment_guid.length.should.equal(1);
                done();
            });
    });

    it('DELETE /comment/*new_comment_guid* should return 200', function (done) {
        var post_data='{"_method":"delete"}';
        http.request()
            .post('/comment/'+new_comment_guid[0])
            .set('Content-Type','application/json')
            .set('Content-length',post_data.length)
            .write(post_data)
            .expect(200, done);
    });

    it('DELETE /comment/*nonexistent_comment_guid* should return 404', function (done) {
        var post_data='{"_method":"delete"}';
        http.request()
            .post('/comment/'+new_comment_guid[0])
            .set('Content-Type','application/json')
            .set('Content-length',post_data.length)
            .write(post_data)
            .expect(404, done);
    });

    it('GET /tips/next?language=it should return 200 and no data', function (done) {
        http.request()
            .get('/tips/next?language=it')
            .expect("{\"content\":{}}", done);
    });

    it('GET /tips/next?language=en should return 200 and sample data', function (done) {
        http.request()
            .get('/tips/next?language=en')
            .expect("{\"content\":{\"guid\":1,\"tipTitle\":\"Example title\",\"tipText\":\"Example text\",\"tipImg\":null}}", done);
    });

    it('GET /tips/img/1 should return 404', function (done) {
        http.request()
            .get('/tips/img/1')
            .expect(404, done);
    });

    it('GET /social/tagSummary should return 200', function (done) {
        http.request()
            .get('/social/tagSummary')
            .expect(200, done);
    });

    it('GET /social/tagSummary should return data', function (done) {
        http.request()
            .get('/social/tagSummary')
            .expect('{"content":[{"guid":"alpha","tag":"alpha","occurrences":1,"visible":false},{"guid":"tango","tag":"tango","occurrences":1,"visible":false},{"guid":"a","tag":"a","occurrences":1,"visible":false},{"guid":"b","tag":"b","occurrences":1,"visible":false},{"guid":"c","tag":"c","occurrences":1,"visible":false}]}', done);
    });

    it('GET /social/tags should return data', function (done) {
        http.request()
            .get('/social/tags?tags=alpha,tango&bbox=1000,0,1000,0')
            .expect('{"content":[{"guid":"alpha","tag":"alpha","occurrences":1,"visible":false},{"guid":"tango","tag":"tango","occurrences":1,"visible":false},{"guid":"a","tag":"a","occurrences":1,"visible":false},{"guid":"b","tag":"b","occurrences":1,"visible":false},{"guid":"c","tag":"c","occurrences":1,"visible":false}]}', done);
    });
});