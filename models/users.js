const mongoose = require('mongoose');

// Messages Schema
const messageSchema = mongoose.Schema({
    body: String,
    type: Number,
    to: String,
    from: String
});

//Group Schema
const groupSchema = mongoose.Schema({
    groupName: String
});

//User Schmea
const userSchema = mongoose.Schema({
    name: String,
    groups: [groupSchema],
    messages: [messageSchema]
});


const User = module.exports = mongoose.model('User', userSchema, 'users');

// Get User
module.exports.getUser = (username, callback) => {
    User.findOne({ name: username }, callback);
}

// Get All Users
module.exports.getAllUsers = (callback) => {
    User.find({}).select('name -_id').then(callback);
}

//Create User
module.exports.createUser = (data, callback) => {
    User.create(data, callback);
}

// Get Groups
module.exports.getGroup = (username, groupname, callback) => {
    User.findOne({name:username}, 'groups', callback);
}

// Get User by Group
module.exports.getUserlistByGroup = (name, callback) => {
    User.find({'groups.groupName': name}).select('name -_id').then(callback);
}

//Create Group
module.exports.createGroup = (username, g_name, callback) => {
    User.update({name:username},
        {
            $push: {
                groups: {
                    groupName: g_name
                }
            }
        },
        callback);
}

//Create Message
module.exports.createMessage = (data, callback) => {
    if (data.type === 0) {//Broadcast Emit
        User.update({},
            {
                $push: {
                    messages: data
                }
            },
            { multi: true },
            callback);
    }
    else if (data.type === 1) {//Group Emit
        var groupName = data.to;

        User.getGroup(data.from, groupName, function (err, group) {

            if (group.groups.length === 0 || checkArray(group.groups, groupName)) {//Create Group
                console.log("Group not found: " + groupName);
                console.log("Creating new group: " + groupName + " ...");
                User.createGroup(data.from, groupName, function (err) {
                    if (err) {
                        console.log("Group couldn't created: " + groupName);
                    } else {
                        console.log("Group " + groupName + " is created by " + data.from);
                    }
                });
            }

            //Get Existing Group and send group message
            User.update({ 'groups.groupName': data.to },
                {
                    $push: {
                        messages: data
                    }
                },
                { multi: true },
                callback);

        });
    } else if (data.type === 2) {//Send to private message
        var to = data.to;
        var from = data.from;
        var body = data.body;
        console.log("Trying to sending message from " + from + " to " + to);
        User.getUser(to, function(err, user) {
            if (err) {
                console.log("User not found: " + to);
                return;
            } else {
                User.update({name:data.to},
                    
                    
                {
                    $push: {
                        messages: data
                    }
                },
              
                callback);
            }
        });

        User.getUser(from, function(err, user) {
            if (err) {
                console.log("User not found: " + from);
            }
            User.update({name:data.from},
                    
                    
                {
                    $push: {
                        messages: data
                    }
                },
                
                function(error, response) {
                    if (error) {
                        console.log("Message couldn't write to " + from + " db.");
                    } else {
                        console.log("Message has been written to " + from + "database.");
                    }
                });
        });
    }

}

function checkArray(array, text){
    for (var i = 0; i < array.length; i++) {
        if(array[i].groupName === text){
            return false;
        }
    }
    return true;
}