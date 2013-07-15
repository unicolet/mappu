var app = require('../app')
    , http = require('support/http')
    , qs = require('querystring')
    , should = require('should');


var new_link_guid=[];

describe('Mappu Settings API - Links', function () {

    before(function (done) {
        app.auth.enable(false);
        http.createServer(app.application, done);
    });

    after(function (done) {
        app.auth.enable(true);
        done();
    });

    it('GET /links/list should return a link list', function (done) {
        http.request()
            .get('/links/list')
            .end(function(res) {
                res.statusCode.should.equal(200);
                var links = JSON.parse(res.body).content;
                links.should.have.lengthOf(1);
                links[0].should.have.property('layer','states');
                links[0].should.have.property('layer_group','top');
                links[0].should.have.property('url','the_url');
                links[0].should.have.property('description','descr');
                links[0].should.have.property('title','title');
                links[0].should.have.property('feature_id','');
                links[0].should.have.property('enabled',true);
                links[0].should.have.property('guid',1);
                done();
            });
    });

    it('PUT /links/1 should save a link', function (done) {
        var post_data=qs.stringify({ guid: 1, enabled: false,layer: 'states',layer_group: 'top',feature_id: '',url: 'the_url',description: 'descr',title: 'changed' });
        http.request()
            .put('/links/1')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var links = JSON.parse(res.body).content;
                links.should.have.property('layer','states');
                links.should.have.property('layer_group','top');
                links.should.have.property('url','the_url');
                links.should.have.property('description','descr');
                links.should.have.property('title','changed');
                links.should.have.property('feature_id','');
                links.should.have.property('enabled',false);
                links.should.have.property('guid',1);
                done();
            });
    });

    it('PUT /links/1 should save a link (reverse previous)', function (done) {
        var post_data=qs.stringify({ guid: 1, enabled: true,layer: 'states',layer_group: 'top',feature_id: '',url: 'the_url',description: 'descr',title: 'title' });
        http.request()
            .put('/links/1')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var links = JSON.parse(res.body).content;
                links.should.have.property('layer','states');
                links.should.have.property('layer_group','top');
                links.should.have.property('url','the_url');
                links.should.have.property('description','descr');
                links.should.have.property('title','title');
                links.should.have.property('feature_id','');
                links.should.have.property('enabled',true);
                links.should.have.property('guid',1);
                done();
            });
    });

    it('POST /links/ should insert a link', function (done) {
        var post_data=qs.stringify({ enabled: true,layer: '_states',layer_group: '_top',feature_id: '',url: '_the_url',description: '_descr',title: '_title' });
        http.request()
            .post('/links/')
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var link = JSON.parse(res.body).content;
                link.should.have.property('layer','_states');
                link.should.have.property('layer_group','_top');
                link.should.have.property('url','_the_url');
                link.should.have.property('description','_descr');
                link.should.have.property('title','_title');
                link.should.have.property('feature_id','');
                link.should.have.property('enabled',true);
                link.guid.should.be.above(1)
                new_link_guid.push(link.guid)
                done();
            });
    });

    it('PUT /links/<new_guid> should update link, with password also changes password', function (done) {
        var post_data=qs.stringify({ guid: new_link_guid[0], enabled: false,layer: 'states',layer_group: 'top',feature_id: '',url: 'the_url',description: 'descr',title: 'title' });
        http.request()
            .put('/links/'+new_link_guid[0])
            .set('Content-Type','application/x-www-form-urlencoded')
            .set('Content-length',post_data.length)
            .write(post_data)
            .end(function(res) {
                res.statusCode.should.equal(200);
                var link = JSON.parse(res.body).content;
                link.should.have.property('layer','states');
                link.should.have.property('layer_group','top');
                link.should.have.property('url','the_url');
                link.should.have.property('description','descr');
                link.should.have.property('title','title');
                link.should.have.property('feature_id','');
                link.should.have.property('enabled',false);
                link.guid.should.be.equal(new_link_guid[0]);
                done();
            });
    });
});
