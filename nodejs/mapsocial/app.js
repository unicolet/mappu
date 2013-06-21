/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , db = require('./modules/connection')
    , auth = require('./modules/auth')
    , mappu = require('./routes/mappu')
    , jts = require('./routes/jts')
    , redis = require('redis')
    , system_users = require('./routes/system.users.js');

var app_context = process.env.NODE_APP_CONTEXT ? process.env.NODE_APP_CONTEXT : "";
var cookie_secret = process.env.NODE_COOKIE_SECRET ? process.env.NODE_COOKIE_SECRET : "yadayadayada";

var app = express();
var redisInstance = redis.createClient();
var RedisStore = require('connect-redis')(express);

// utility function to make the raw request stream available
// used by jts functions
saveRawBody = function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
       data += chunk;
    });

    req.on('end', function() {
        req.rawBody = data;
        next();
    });
};

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(cookie_secret));
    app.use(express.session({
        store: new RedisStore({client: redisInstance})
    }));
    app.use(function (req, res, next) {
        res.db = db;
        next();
    });
    app.use(auth.auth(
        true, // disable access by default
        [
            {path:app_context+"/j_spring_security_check", roles:["EVERYONE"]},
            {path:app_context+"/logout", roles:["EVERYONE"]},
            {path:app_context+"/login/userInfo", roles:["EVERYONE"]},
            {path:app_context+"/**", roles:["ROLE_USER"]}
        ]
    ));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get   (app_context+'/', routes.index);
app.post  (app_context+'/j_spring_security_check', user.login);
app.get   (app_context+'/login/userInfo', user.userInfo);
app.get   (app_context+'/login/', user.keepAlive);
app.get   (app_context+'/logout', user.logout);
app.get   (app_context+'/layerQuery', mappu.layerQuery);
app.get   (app_context+'/link', mappu.link);
app.get   (app_context+'/social/tagSummary',mappu.tagSummary);
app.get   (app_context+'/social/tags',mappu.tags);
app.get   (app_context+'/social/:id', mappu.social);
app.post  (app_context+'/social/:id', mappu.socialSave);
app.put   (app_context+'/social/:id', mappu.socialSave);
app.get   (app_context+'/social/:id/comments', mappu.comments);
app.post  (app_context+'/comment/', mappu.saveComment);
app.delete(app_context+'/comment/:id', mappu.deleteComment);
app.get   (app_context+'/tips/next', mappu.nextTip);
app.get   (app_context+'/tips/img/:id',mappu.tipImg);
app.post  (app_context+'/jts/:operation', saveRawBody, jts.processJstsRequest);

// settings api
app.get   (app_context+'/users/list', system_users.list);
app.put   (app_context+'/users/:id', system_users.save);
app.post   (app_context+'/users/', system_users.save);

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log("* Express server listening on port " + app.get('port')+app_context);
    });
} else {
    // used by tests to config the app
    exports.application = http.createServer(app);
    exports.auth=auth;
}
