const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mongoose = require('mongoose');
var users = require('./models/users');


var onlineUsers = [];

/* var connections = [];
 */
server.listen(process.env.PORT || 3000);
console.log('Server started at PORT: *3000');

mongoose.connect('mongodb://localhost/chatapp');
var db = mongoose.connection;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
    console.log('Someone is connected.');
/*     .push(socket);
    console.log('Total connections: ' + connections.length); */

    socket.on('disconnect', function (data) {
        
    });

    socket.on('send message', function (data, callback) {
        console.log("Request Received Message: " + JSON.stringify(data, "", 2));
        users.createMessage(data, function (err) {
            if (err) {
                console.log (err);

                data.from = "Server";
                data.body = "ERROR";
            }
            else {
                console.log("Message has been written to database.");
                socket.broadcast.emit('new message', data);
                console.log("Broadcasting Received Message: " + JSON.stringify(data, "", 2));
            }
            callback(data);
        });

    });

    socket.on('new user', function (username, callback) {
        console.log('Request Received Username: ' + username);
        var control = users.getUser(username, function (err, userdata) {
            if (err) {
                console.log(err);
            }
            else if (userdata.length === 0) {
                //Create New User
                console.log("User Not Found Create New User");
                var dbData = {
                    name: username,
                    groups: [],
                    messages: []
                }
                users.createUser(dbData, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        //New User Created to Database
                        console.log(data);
                        callback(data);
                    }
                });
            }
            else {
                //Return User Data to Client
                console.log("User Found: " + userdata);
                callback(userdata);
            }
        });



        //updateUsernames();
    });

    /*function updateUsernames(){
        io.sockets.emit('get users', users);
    }*/
});