var crypto = require('crypto');

/*
 * GET users listing.
 */

exports.login = function(req, res) {
    if(req.body && req.body.j_username && req.body.j_password) {
        var encrypted_password=crypto.createHash("sha256").update(req.body.j_password).digest('hex');
        res.db.query("SELECT username FROM person WHERE username = $1 AND \"password\" = $2 and enabled=true", [req.body.j_username, encrypted_password], function(err, result) {
            var success = (!err && result.rows.length==1);
            if(success) {
                // save user in session
                var user={'username':result.rows[0]['username']};
                req.session.user=user;
                res.db.query("SELECT authority FROM authority a, person_authority pa, person p WHERE pa.authority_id=a.id AND pa.person_id=p.id AND p.username=$1",[req.body.j_username],function(err,result){
                    if(!err) {
                        var roles=[];
                        for(var i=0, l=result.rows.length; i<l; i++) {
                            roles.push(result.rows[i]['authority']);
                        }
                        user.roles=roles;
                        req.session.user=user;
                    }
                    res.send(JSON.stringify({ 'success': success, 'guid': user?user.username:'' }));
                });
            } else {
                // failure
                res.send(JSON.stringify({ 'success': success, 'guid': '' }));
            }
        });
    } else {
        if(res.session)
            res.session.user = null;
        res.send(JSON.stringify({ success: false, content: [] }));
    }
};

exports.userInfo = function(req, res) {
    // IE needs these
    res.setHeader("Cache-Control", "no-cache"); // HTTP 1.1
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0
    res.contentType('application/json');

    if(req.session && req.session.user) {
        res.send(JSON.stringify({
            'success': true,
            'guid': req.session.user.username,
            'username': req.session.user.username,
            'authenticated': true
        }));
    } else {
        res.send(JSON.stringify({ error: "Not authenticated" }));
    }
};

exports.keepAlive = function(req, res) {
    if(req.session && req.session.user) {
        res.send(200, JSON.stringify({
            'success': true
        }));
    } else {
        res.send(404, JSON.stringify({ error: "Not authenticated"}));
    }
};

exports.logout = function(req, res) {
    delete req.session.user;
    res.send(JSON.stringify({
        'success': true
    }));
};
