
exports.find=function(req,res,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    console.log("");
    connection.query("select social_id guid, tags, username, starred, x, y from social where social_id = $1", [req.params.id], function(err, result) {
        var social={};
        var http_code=404;
        if (!err && result.rows.length==1) {
            social=result.rows[0];
            http_code=200;
        }

        cb(http_code, {content:social});
    });
};

exports.nextid=function(req,res,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    connection.query("select nextval('hibernate_sequence') id", [], function(err, result) {
        var http_code=500;
        var id=null;
        if (!err && result.rows.length==1) {
            id=result.rows[0]['id'];
            http_code=200;
        }

        cb(http_code, id);
    });
};

exports.findComments=function(req,res,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    connection.query("select id guid, text, social, username, to_char(date_created, 'YYYY-MM-ddThh:MI:ss+01:00') \"dateCreated\", to_char(last_updated, 'YYYY-MM-ddThh:MI:ss+01:00') \"lastUpdated\" from comment where social=$1", [req.params.id], function(err, result) {
        var comment=[];
        var http_code=500;
        if (!err) {
            comment=result.rows;
            http_code=200;
        }

        cb(http_code, {content:comment});
    });
};

exports.findCommentById=function(id, req,res,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    connection.query("select id guid, text, social, username, to_char(date_created, 'YYYY-MM-ddThh:MI:ss+01:00') \"dateCreated\", to_char(last_updated, 'YYYY-MM-ddThh:MI:ss+01:00') \"lastUpdated\" from comment where id=$1", [id], function(err, result) {
        var comment={};
        var http_code=404;
        if (!err && result.rows.length==1) {
            comment=result.rows[0];
            http_code=200;
        }

        cb(http_code, {content:comment});
    });
};