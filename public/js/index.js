$(function() {

    var serverBaseUrl = document.domain;

    var socket = io.connect(serverBaseUrl);
    // identification of each user    
    var sessionId = '';

    // the input element of the login view
    var $loginInput = $('.login_input');
    // the element to contain the message list
    var $message_field = $('.message_field');
    // the list element to show message
    var $message_list = $('.message_list')
    // the input element ofthe message view
    var $message_input = $('.message_input');
    // the view of the login page
    var $loginView = $('.login_view');
    // the view of the message page
    var $messageView = $('.message_view');

    // the state of whether the user is loged in
    var logined = false;
 
    // the user name in the chat
    var myname = '';

    $(document).ready(function(){
        $(window).keydown(function (event) {
            // send the message or login  when "enter" is pressed
            if (event.which == 13) {
                if(logined)
                    sendMessage();
                else
                    login();
            }
        });
    });

    /*
       When the client successfully connects to the server, an
       event "connect" is emitted.
    */
    socket.on('connect', function () {
        sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);  
        socket.on('disconnect', function(){
            console.log(sessionId + 'disconnected');
        }); 
    });

    // on connection, get all chat records and display them
    socket.on('records',function(data){
      if (!logined) {
        $.each(data.content, function(index,message){
           addUserMessage(message);
        });
      }
    });

 
    // When receiving a new chat message 
    socket.on('new message', function (data) {
        addUserMessage(data);
    });

    // Log an error if unable to connect to server
    socket.on('error', function (reason) {
      console.log('Unable to connect to server', reason);
    });

    
    // when the user loged in, display the message view and start chatting
    function login(){
        var username = escape($loginInput.val().trim());
        if(username){
            myname = username;
            $loginInput.val('');
            $loginView.fadeOut(function(){
                logined = true;
                $messageView.show();
                $message_input.focus();
                socket.emit('new user', username);
            });
        }
    }

    // when the user hit to send a message, send it to the server
    function sendMessage(){
        var message = escape($message_input.val().trim());
        if(message){
            $message_input.val('');
            console.log("Writing message: " + message);
            socket.emit('send message', message);
        }
    }

    // make the text input clean, without html element
    function escape(text){
        return $('<div>').text(text).html();
    }

    // add the users' message to the message list
    function addUserMessage(message){

        if(myname == message.user_name){
            var $sender = $('<span>').addClass('message_from').append().text("me");
        } else {
            var $sender = $('<span>').addClass('message_from').append().text(message.user_name);
        }

        var $time = $('<span>').addClass('message_time').append().text(message.message_time);
        var $text = $('<p>').addClass('message_text').append().text(message.message_text);
        var $title = $('<p>').addClass('message_title').append($sender,$time);
        var $element;

        if(myname == message.user_name){
            $element = $('<li>').addClass('message_item self').append($title,$text);
        } else {
            $element = $('<li>').addClass('message_item others').append($title,$text);
        }

        $message_list.append($element);
        $message_list[0].scrollTop =  $message_list[0].scrollHeight;
    }

});