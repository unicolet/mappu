var user=require('../models/user')
    , crypto = require('crypto');


exports.list = function(req,res) {
    user.list(req,res,function(http_code, data) {
        res.send(http_code, JSON.stringify(data));
    }, null);
};

exports.save = function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "admin";
    var conn=null;

    var handleError=function(err) {
        release();
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

            var params=[req.body.enabled,db_id];
            var query="update person set enabled=$1 where id=$2";

            var enc_password=null;
            if(req.body.password) {
                enc_password=crypto.createHash("sha256")
                    .update(req.body.password)
                    .digest('hex');
                    params=[req.body.enabled,enc_password,db_id];
                    query="update person set enabled=$1,password=$2 where id=$3";
            }
            conn.query(query, params, function(err, result) {
                if(!err) {
                    user.find(req,res,db_id, function(http_code, data) {
                        end(http_code, data);
                    }, conn);
                } else {
                    handleError(err);
                }
            });
        } else { // insert
            user.nextid(req,res,function(http_code, id) {
                if(id) {
                    if(req.body.password && req.body.passwordRepeat && req.body.password==req.body.passwordRepeat) {
                        var enc_password=crypto.createHash("sha256")
                            .update(req.body.password)
                            .digest('hex');
                        var params=[id,req.body.username,req.body.enabled, enc_password];
                        conn.query("insert into person (id,username,enabled,password,version,account_expired,account_locked,password_expired) values($1,$2,$3,$4,1,false,false,false)", params, function(err, result) {
                            if(!err) {
                                conn.query("insert into person_authority (person_id, authority_id) values($1,1)", [id], function(err, result) {
                                    if(!err) {
                                        user.find(req,res,id,function(s, data) {
                                            end(http_code, data);
                                        }, conn);
                                    } else {
                                        handleError(err);
                                    }
                                });
                            } else {
                                handleError(err);
                            }
                        });
                    } else {
                        end(400, "Missing password or password mismatch");
                    }
                } else {
                    handleError(err);
                }
            }, conn)
        }
    });
};
