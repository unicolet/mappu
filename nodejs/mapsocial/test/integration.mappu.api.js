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
            .get('/social/tags?tags=alpha,tango&bbox=0,0,1000.00,1000.00')
            .expect('{"content":[{"id":1,"tags":"alpha,tango","x":10.5,"y":20.4}]}', done);
    });

    it('GET /social/tags with wrong bbox should return no data', function (done) {
        http.request()
            .get('/social/tags?tags=alpha,tango&bbox=-18586546.025509,1788073.5773642,-3225760.8234573,7726924.9261826')
            .expect('{"content":[]}', done);
    });
});

// MULTIPOLYGON(((-8233668.769478377 4980450.957528393,-8233729.883878823 4980494.474885386,-8233748.696872769 4980507.26549679,-8233783.98515135 4980526.524954762,-8233808.698078306 4980552.400316877,-8233820.497944329 4980571.659863874,-8233765.172157404 4980903.047638082,-8233759.272224393 4980949.360489863,-8233741.683744849 4980988.0282137515,-8233711.070884881 4981007.28862005,-8233681.682539311 4981026.54906434,-8233639.381132808 4981032.724176662,-8233585.279860283 4981025.96095861,-8233542.978453782 4981025.666905755,-8233501.901561679 4981031.842017521,-8233477.188634723 4981051.1025102455,-8233436.000423131 4981063.893850842,-8233399.598949641 4981076.685208191,-8233370.210604072 4981076.391153813,-8233310.209398533 4981069.6279055085,-8233263.232573419 4981062.864661897,-8233227.944294837 4981075.656017899,-8233197.331434869 4981101.385807742,-8233156.254542765 4981101.091752618,-8233132.654810718 4981087.859281199,-8233120.966264185 4981068.157634762,-8233115.066331173 4981022.4323249655,-8233115.066331173 4980950.830742721,-8233097.477851627 4980885.698753337,-8233073.8781195795 4980838.357038243,-8233067.978186567 4980792.779827538,-8233073.8781195795 4980760.140794476,-8233365.423865966 4980235.2848411435,-8233378.448246389 4980222.2005573455,-8233432.438199423 4980228.522175415,-8233457.151126381 4980241.459453067,-8233523.052264931 4980326.140239135,-8233571.253604444 4980385.828873335,-8233613.555010945 4980418.172620646,-8233668.769478377 4980450.957528393)))*
// jts apis
//{"geom":"POLYGON ((-8233671.5 4980446.5, -8233672 4980447, -8233733 4980490.5, -8233751 4980503, -8233786.5 4980522, -8233787 4980522.5, -8233787.5 4980523, -8233812 4980549, -8233812.5 4980550, -8233824.5 4980569, -8233825 4980569.5, -8233825.5 4980570.5, -8233825.5 4980571.5, -8233825.5 4980572.5, -8233770 4980903.5, -8233764.5 4980950, -8233764.5 4980951, -8233764 4980951.5, -8233746 4980990, -8233745.5 4980991, -8233745 4980991.5, -8233744 4980992, -8233713.5 4981011.5, -8233684 4981030.5, -8233683 4981031, -8233682 4981031.5, -8233640 4981037.5, -8233639 4981037.5, -8233585 4981031, -8233543.5 4981030.5, -8233504 4981036.5, -8233480 4981055, -8233479.5 4981055.5, -8233478.5 4981056, -8233437.5 4981068.5, -8233401 4981081, -8233400.5 4981081.5, -8233399.5 4981081.5, -8233370 4981081.5, -8233369.5 4981081.5, -8233309.5 4981074.5, -8233263.5 4981068, -8233230.5 4981080, -8233200.5 4981105.5, -8233200 4981106, -8233199 4981106, -8233198.5 4981106.5, -8233197.5 4981106.5, -8233156.5 4981106, -8233155 4981106, -8233154 4981105.5, -8233130 4981092.5, -8233129.5 4981092, -8233128.5 4981091, -8233128 4981090.5, -8233116.5 4981070.5, -8233116.5 4981069.5, -8233116 4981068.5, -8233110 4981023, -8233110 4981022.5, -8233110 4980951.5, -8233093 4980887.5, -8233069.5 4980840.5, -8233069 4980840, -8233069 4980839, -8233063 4980793.5, -8233063 4980793, -8233063 4980792, -8233069 4980759, -8233069.5 4980758.5, -8233069.5 4980757.5, -8233361 4980233, -8233362 4980232, -8233375 4980218.5, -8233375.5 4980218, -8233376.5 4980217.5, -8233377.5 4980217, -8233378 4980217, -8233379 4980217, -8233433 4980223.5, -8233434 4980223.5, -8233435 4980224, -8233459.5 4980237, -8233460 4980237.5, -8233461 4980238.5, -8233527 4980323, -8233575 4980382.5, -8233616.5 4980414, -8233671.5 4980446.5))","area":454265}