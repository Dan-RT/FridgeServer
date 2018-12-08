let mongoose = require('mongoose');

let FridgeListSchema  = new mongoose.Schema({
    tokenUser: Number,
    ingredients: Array,
    groceries: Array,
    recipes: Array
});

module.exports = mongoose.model('FridgeListSchema', FridgeListSchema);