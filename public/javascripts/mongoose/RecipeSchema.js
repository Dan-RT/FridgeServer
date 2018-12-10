let mongoose = require('mongoose');

let recipeSchema  = new mongoose.Schema({
    idAPI: String,
    name: String,
    ingredientsBarcode: Array,
    keywords: Array,
    description: String
});

module.exports = mongoose.model('Recipe', recipeSchema);