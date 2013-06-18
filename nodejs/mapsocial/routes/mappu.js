
var social=require('../models/social');

exports.layerQuery=function(req, res) {
    res.db.query("select id guid, name, description, layer, filter_string \"filterString\" from layer_query", [], function(err, result) {
        var queries=[];
        if (!err && result.rows.length>=1)
            queries=result.rows;
        res.send(JSON.stringify({content:queries}));
    });
};

exports.link=function(req, res) {
    res.db.query("select id guid, feature_id \"featureId\", layer, layer_group \"layerGroup\", url, description, title from link where enabled=true", [], function(err, result) {
        var links=[];
        if (!err && result.rows.length>=1)
            links=result.rows;
        res.send(JSON.stringify({content:links}));
    });
};

exports.social=function(req, res) {
    social.find(req,res,function(http_code, data) {
        res.send(http_code, JSON.stringify(data));
    });
};

exports.socialSave=function(req, res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "admin";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    if(req.params.id) {
        res.db.acquire(function (err, connection) {
            if(err) handleError(err);
            conn=connection;
            conn.query("select id from social where social_id = $1", [req.params.id], function(err, result) {
                if (err) {
                  handleError(err);
                } else if (result.rows.length==1) { // found, hence update
                    var db_id=result.rows[0].id;
                    var params=[parseFloat(req.body.x),parseFloat(req.body.y),req.body.starred?true:false,req.body.tags,username,db_id];
                    conn.query("update social set x=$1,y=$2,starred=$3,tags=$4,username=$5 where id=$6", params, function(err, result) {
                        if(!err) {
                            social.find(req,res,function(http_code, data) {
                                end(http_code, data);
                            }, conn);
                        } else {
                            handleError(err);
                        }
                    });
                } else { // insert
                    social.nextid(req,res,function(http_code, id) {
                        if(id) {
                            var params=[id,req.params.id,parseFloat(req.body.x),parseFloat(req.body.y), req.body.starred?true:false ,req.body.tags,username];
                            conn.query("insert into social (id,social_id,x,y,starred,tags,username,version) values($1,$2,$3,$4,$5,$6,$7,1)", params, function(err, result) {
                                if(!err) {
                                    social.find(req,res,function(s, data) {
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
        });
    } else {
        res.send(404,JSON.stringify({'content':{}}));
    }
};

exports.comments=function(req,res) {
    social.findComments(req,res,function(http_code, data) {
        res.send(http_code, JSON.stringify(data));
    }, null);
};

exports.saveComment=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
        social.nextid(req,res,function(http_code, id) {
            if(id) {
                var params=[id,req.body.social,req.body.text,username];
                conn.query("insert into comment (id,social,text,username,version,date_created,last_updated) values($1,$2,$3,$4,1,now(),now())", params, function(err, result) {
                    if(!err) {
                        social.findCommentById(id,req,res,function(s, data) {
                            end(http_code, data);
                        }, conn);
                    } else {
                        handleError(err);
                    }
                });
            } else {
                handleError(err);
            }
        }, conn);
    });
};

exports.deleteComment=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
            var params=[req.params.id];
            conn.query("delete from comment where id=$1", params, function(err, result) {
                if(!err) {
                    if(result.rowCount==1) {
                        end(200, "");
                    } else if(result.rowCount==0) {
                        end(404, "");
                    } else {
                        end(500, "deleted "+result.rows.count+" rows!")
                    }
                } else {
                    handleError(err);
                }
            });
    }, conn);
};

exports.nextTip=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
        var params=[req.query.language];
        conn.query("select id guid, title \"tipTitle\", text \"tipText\", CASE WHEN image_data is null THEN null ELSE '/mapsocial/tips/img/'||id END \"tipImg\" from usage_tip where language=$1 and enabled=true", params, function(err, result) {
            if(!err) {
                var tip={};
                if(result.rows.length>=1) {
                    var randomIndex=Math.round(Math.random()*result.rows.length);
                    if(randomIndex==result.rows.length) randomIndex--;
                    tip=result.rows[randomIndex];
                }
                end(200, {"content":tip});
            } else {
                handleError(err);
            }
        });
    }, conn);
};

exports.tipImg=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.status(http_code);
        res.end(data);
        return;
    };

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
        var params=[req.params.id];
        conn.query("select image_data, mime_type from usage_tip where id=$1 and image_data is not null and enabled=true", params, function(err, result) {
            if(!err) {
                // image_data is a Buffer object
                if(result.rows.length==1 && result.rows[0].image_data!=null) {
                    var image=result.rows[0];
                    res.set({
                      'Content-Type': image.mime_type,
                      'Content-Length' : image.image_data.length
                    })
                    end(200, image.image_data);
                } else {
                    end(404);
                }
            } else {
                handleError(err);
            }
        });
    }, conn);
};

exports.tagSummary=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    var order_clause=" order by occurrences desc";
    var all_tags="select tag guid, tag, occurrences, false visible from tags where occurrences>0 ";
    var filtered_tags="select t.tag guid, t.tag, t.occurrences, false visible from tags t, social_tags st, social s where t.tag=st.tag and s.id=st.social_id and t.occurrences>0 ";

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
        var params=[];
        var query=all_tags;
        if( req.query["mine"] !== undefined || req.query["layer"] !== undefined) {
            query=filtered_tags;
        }
        if( req.query["mine"] !== undefined ) {
            params.push(username);
            query=query + " and s.username=$"+params.length;
        }
        if( req.query["layer"] !== undefined ) {
            params.push(req.query["layer"]+":%");
            query=query+" and s.social_id like $"+params.length;
        }
        conn.query(query + order_clause, params, function(err, result) {
            if(!err) {
                end(200, {content:result.rows});
            } else {
                handleError(err);
            }
        });
    }, conn);
};

exports.tags=function(req,res) {
    // for testing, must be fixed
    var username=req.session.user ? req.session.user.username : "demo";
    var conn=null;

    var handleError=function(err) {
        release();
        console.log(err);
        res.send(500, JSON.stringify(err));
        return;
    };

    var release=function() {
        if(conn) res.db.release(conn);
    };

    var end=function(http_code, data) {
        release();
        res.send(http_code, JSON.stringify(data));
        return;
    };

    res.db.acquire(function (err, connection) {
        if(err) handleError(err);
        conn=connection;
        var tags=req.query.tags.split(',');
        var bbox=req.query.bbox.split(',');

        var params=[];
        var tagsPlaceholders = [];
        for(var i=0, l=tags.length, offset=bbox.length;i<l;i++) {
            tagsPlaceholders.push("$"+(i+offset+1)); // 5 is bbox length
        }
        params=params.concat(bbox.map(function(el,idx,array){
                    return parseFloat(el);
        }));
        params=params.concat(tags);
        // 1000.00,0.00,1000.00,0.00
        var query = 'select distinct s.id ,s.tags tags ,s.x x, s.y y from social_tags as st, social as s where st.social_id=s.id '+
                        'and s.x <= $3 and s.x >= $1 and s.y <= $4 and s.y >= $2 ' +
                        'and st.tag in ('+( tagsPlaceholders.join(",") ) +')';
        if( req.query["mine"] !== undefined ) {
            params.push(username);
            query=query+" and s.username=$"+params.length;
        }

        if( req.query["layer"] !== undefined ) {
            params.push(req.query["layer"]+":%");
            query=query+" and s.social_id like $"+params.length;
        }

        conn.query(query, params, function(err, result) {
            if(!err) {
                end(200, {content:result.rows});
            } else {
                handleError(err);
            }
        });
    }, conn);
};