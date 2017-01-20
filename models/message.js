// the model for a message
var db = require('../db.js'),
    dateFormat = require('dateformat');
 
// insert a message into a table of the database
exports.insert = function(user_name, message_text, message_time, done) {
  var now = new Date();
  var formatedTime = dateFormat(now, "ddd, dd.mm.yyyy hh:MM:ss TT");
  var values = [user_name, message_text, formatedTime];

  db.get().query('INSERT INTO message_record (user_name, message_text, message_time) VALUES(?, ?, ?)', values, function(err, result) {
    if (err) return done(err);
    done(null, result.insertId);
  })
}

// get all the messages from the table
exports.getAll = function(done) {
  db.get().query('SELECT * FROM message_record', function (err, rows) {
    if (err) return done(err);
    done(null, rows);
  })
}