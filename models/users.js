const mongoose = require('mongoose');

// Messages Schema
const messageSchema = mongoose.Schema({
    body: String,
    type: Number,
    from: String,
    to: String
});

//Group Schema
const groupSchema = mongoose.Schema({
    name: String
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

//Create User
module.exports.createUser = (data, callback) => {
    User.create(data, callback);
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

}