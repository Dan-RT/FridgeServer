let mongoose = require('mongoose');

let userSchema  = new mongoose.Schema({
    name: String,
    token: Number
});

module.exports = mongoose.model('User', userSchema);