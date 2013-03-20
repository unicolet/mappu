var minimatch = require("minimatch");
var url=require('url');

/*
    Example usage:

    app.use(auth(
        true, // disable access by default
        [
            {path:"/j_spring_security_check", roles:["EVERYONE"]},
            {path:"/userInfo", roles:["EVERYONE"]},
            {path:"/layerQuery", roles:["ROLE_USER"]}
        ]
    ));

 */

var enabled=true;

// http://stackoverflow.com/a/6000016/887883
function isFunction(obj){
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

exports.auth=function(deny,conf) {
    var acl=[];
    var defaultIsDeny=true;

    acl=conf;
    defaultIsDeny=!deny;

    return function(req,res,next) {
        var allow=defaultIsDeny;
        // no user in the request
        var hasRoles = (req.session && req.session.user && req.session.user.roles);

        var found=false;
        for(var i=0, l=acl.length;i<l && !found;i++) {
            var ace=acl[i];
            // check path
            if(minimatch(url.parse(req.url).pathname, ace.path)) {
                // check roles
                for(var j=0, L=ace.roles.length;j<L && !found;j++) {
                    if(ace.roles[j]=="EVERYONE") {
                        allow=found=true;
                    }
                    if(hasRoles && req.session.user.roles.indexOf(ace.roles[j]) >= 0)
                        allow=found=true;
                }
            }
        }

        // in the tests pass null as an argument so that you just check the return value
        if(next && isFunction(next)) {
            if(allow || !enabled)
                next();
            else
                res.send(401,"Unauthorized");
        } else {
            return allow || !enabled;
        }
    }
}

exports.enable=function(ena) {
    if(ena != null) {
        // set
        enabled=ena;
    }
    return enabled;
}

