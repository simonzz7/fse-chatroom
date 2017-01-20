//Module dependencies:
var express = require("express"),
  app = express(),
  http = require("http").createServer(app),
  bodyParser = require("body-parser"),
  io = require("socket.io").listen(http),
  _ = require("underscore"),
  db = require('./db'),
  messageModel = require('./models/message'),
  dateFormat = require('dateformat');

//The list of users in our chatroom.
var userlist = [];

// Connect to database
db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to MySQL');
  } else {
  	console.log('connected to MySQL');
  }
});

/* Server config */

//Server's IP address
app.set("ipaddr", "127.0.0.1");

//Server's port number
app.set("port", 8080);

//Specify the views folder
app.set("views", __dirname + "/views");

//View engine is Jade
app.set("view engine", "jade");

//Specify where the static content is
app.use(express.static(__dirname + "/public"));

//Tells server to support JSON requests
app.use(bodyParser.json());

/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get("/", function(request, response) {

  //Render the view called "index"
  response.render("index");

});

/* Socket.IO events */
io.on("connection", function(socket){

    // get historical messages from database
	messageModel.getAll(function(err, rows){
	if(err) {
		console.error(err);
	} else {
	    var messages = {
	        content: _.map(rows, function(row){
	            return { 
	                user_name: row.user_name, 
	                message_text: row.message_text, 
	                message_time: row.message_time
	            };
	        })
	    };
	    io.sockets.emit('records', messages);
	}
	});

    // new message in the chatroom
    socket.on('send message', function(data){
        //Event 'new message' to broadcast to users
        var date = new Date();
        var formatedTime = dateFormat(date, "ddd, dd.mm.yyyy hh:MM:ss TT");
        io.sockets.emit('new message', {user_name: socket.username, message_text: data, message_time: formatedTime});
        messageModel.insert(socket.username, data, formatedTime, function(err){
		    if(err){
                console.error(err);
            }
	    });
    });


    // when a new user connects to the server
	socket.on("new user", function(data) {
	    socket.username = data;
	    userlist.push(socket.username);
	});

  /*
    When a client disconnects from the server, the event "disconnect" is automatically
    captured by the server. It will then emit an event called "userDisconnected" to
    all participants with the id of the client that disconnected
  */
    socket.on('disconnect', function(data){
        userlist.splice(userlist.indexOf(socket.username), 1);
        io.sockets.emit('current userlist',userlist);
    });

});


//Start the http server at port and IP defined before
http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});