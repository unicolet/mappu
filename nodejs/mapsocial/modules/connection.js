
var anyDB = require('any-db')
var connectionString = process.env.NODE_DB_URL ? process.env.NODE_DB_URL : "postgres://social_test:social@localhost/social_test";
var pool = anyDB.createPool(connectionString, {min: 1, max: 20});

exports.query=function(query, params, cb) {
    pool.query(query, params, cb);
};

exports.acquire=function(cb) {
    pool.acquire(cb);
};

exports.release=function(conn) {
    pool.release(conn);
};