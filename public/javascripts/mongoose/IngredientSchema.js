
let mongoose = require('mongoose')

let IngredientSchema  = new mongoose.Schema({
    name: String,
    typeDish: String,
    typeMeal: String,
    weight: Number,
    quantity: Number,
    keywords: Array
});

module.exports = mongoose.model('Ingredient', IngredientSchema);