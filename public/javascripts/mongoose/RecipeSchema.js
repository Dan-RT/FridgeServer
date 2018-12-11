let mongoose = require('mongoose');

let recipeSchema  = new mongoose.Schema({
    name: String,
    ingredientsBarcode: Array,
    keywords: Array,
    description: String
});

module.exports = mongoose.model('Recipe', recipeSchema);