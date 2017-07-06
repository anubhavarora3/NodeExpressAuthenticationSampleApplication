const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    password: {
        type: String
    },
    admin: {
        type: Boolean
    }
});

var User = mongoose.model('User', userSchema);

module.exports = {
    User
};
