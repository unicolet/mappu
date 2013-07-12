exports.list=function(req,res,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    connection.query("select id guid, username, enabled from person order by id asc", function(err, result) {
        var users=[];
        if (!err && result.rows.length>=1)
            users=result.rows;
        cb(200, {content:users});
    });
};

exports.find=function(req,res,id,cb,conn) {
    var connection=res.db;
    if(conn!=null) { connection=conn; }
    connection.query("select id guid, username, enabled from person where id=$1",[id], function(err, result) {
        var user=null;
        if (!err && result.rows.length==1)
            user=result.rows[0];
        cb(200, {content:user});
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
