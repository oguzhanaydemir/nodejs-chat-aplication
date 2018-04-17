const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mongoose = require('mongoose');
var users = require('./models/users');


var onlineUsers = [];

/* var connections = [];
 */
server.listen(process.env.PORT || 3001);
console.log('Server started at PORT: *3000');

mongoose.connect('mongodb://localhost/chatapp');
var db = mongoose.connection;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
    console.log('A guest has been connected to server.');

    socket.on('send message', function (data, callback) {
        console.log("Request Received Message: " + JSON.stringify(data, "", 2));
        users.createMessage(data, function (err) {
            if (err){
                console.log(err);
                data.from = "Server";
                data.body = "ERROR";
            }
            else {
                console.log("Message has been written to database.");
                if (data.type === 0) { //Global message
                    socket.broadcast.emit('new message', data);
                    console.log("Broadcasting Received Message: " + JSON.stringify(data, "", 2));
                } 
                else if(data.type === 1){ //Group message
                    users.getUserlistByGroup(data.to, function(usersInASingleGroup) {
                        console.log(JSON.stringify(usersInASingleGroup, "", 2));

                        for (let i = 0; i < onlineUsers.length; i++) {
                            var singleUser = onlineUsers[i];                       
                            
                            for (let j = 0; j < usersInASingleGroup.length; j++) {
                                if (singleUser.name === usersInASingleGroup[j].name) {
                                    console.log("Gruptaki bulunan üye: " + singleUser.name);
                                    var socketId = singleUser.socket_id;
                                    socket.to(socketId).emit('new message', data);
                                }
                            }
                        }
                    });
                } 
                else if (data.type === 2) { //Private message
                    var id = getSocketId(data.to);
                    users.getUser(data.to, function (err, response) {
                        if (err) {
                            console.log(err);
                        }
                    })
                    console.log("User sent message from " + data.from + " to " + data.to);
                    socket.to(id).emit('new message', data);
                }
            }
            callback(data);
        });
    });

    socket.on('new user', function (username, callback) {
        users.getUser(username, function (err, userdata) {
            if (err) {
                console.log(err);
            }
            else if (userdata === null) {
                //Create New User
                console.log("User Not Found Create New User");
                var dbData = {
                    socket_id: socket.id,
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
                        notifyAllUsersInDB();
                        callback(data);
                    }
                });
            }
            else {
                //Return User Data to Client
                console.log("User Found: " + userdata);
                notifyAllUsersInDB();
                callback(userdata);
            }

            console.log(username + " has been connected to the server.");
        });
        var onlineUser =
        { 
            name: username, 
            socket_id : socket.id 
        }
        onlineUsers.push(onlineUser);
    });

    function notifyAllUsersInDB() {
        users.getAllUsers(function(res){
            io.emit('allUsersInDB', res);
        });
    }

    function getSocketId(username) {
        for (var i = 0; i < onlineUsers.length; i++) {
            if (onlineUsers[i].name === username) {
                return onlineUsers[i].socket_id;
            }
        }
    }
});