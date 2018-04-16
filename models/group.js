const mongoose = require('mongoose');

// Groups Schema
const groupSchema = mongoose.Schema({
	name: String
});

const Groups = module.exports = mongoose.model('Groups', groupSchema,'groups');

// Get Groups
module.exports.getGroups= (name, callback) => {
	
}


//Create Groups
module.exports.createGroup = (data, callback) => {
    Groups.create(data, callback);
}