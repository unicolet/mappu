var link=require('../models/link')
    , crypto = require('crypto');


exports.list = function(req,res) {
    link.list(req,res,function(http_code, data) {
            res.send(http_code, JSON.stringify(data));
        }, null);
};


exports.save = function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "admin";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));

    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));

    };

    if(req.body.enabled==='true') {
	    req.body.enabled=true;
    } else if(req.body.enabled==='false') {
	    req.body.enabled=false;
    }

    res.db.acquire(function (err, conn) {
        if (req.params.id) { // found, hence update
            var db_id=req.params.id;

            var params=[db_id, req.body.enabled, req.body.title, req.body.layer,req.body.layerGroup,req.body.featureId,req.body.url,req.body.description];
            var query="update link set enabled=$2,title=$3,layer=$4,layer_group=$5,feature_id=$6,url=$7,description=$8 where id=$1";

            conn.query(query, params, function(err, result) {
                if(!err) {
                    link.find(req,res,db_id, function(http_code, data) {
                        end(http_code, data);
                    }, conn);
                } else {
                    handleError(err);
                }
            });
        } else { // insert
            link.nextid(req,res,function(http_code, id) {
                if(id) {
                    var params=[id, req.body.enabled, req.body.title, req.body.layer,req.body.layerGroup,req.body.featureId,req.body.url,req.body.description];
                    conn.query("insert into link (id,version,enabled,title,layer,layer_group,feature_id,url,description) values($1,1,$2,$3,$4,$5,$6,$7,$8)", params, function(err, result) {
                        if(!err) {
                            link.find(req,res,id,function(s, data) {
                                end(http_code, data);
                            }, conn);
                        } else {
                            handleError(err);
                        }
                    });
                } else {
                    handleError(err);
                }
            }, conn)
        }
    });
};
