// the helper for the database connection
var mysql = require('mysql');

// the connection pool
var pool = {};

// establisth the connection pool
exports.connect = function(done) {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'chatroom',
    password: '123',
    database: 'chatroom'
  });
  if(done) done();
}

// get the connection pool
exports.get = function() {
  return pool;
}