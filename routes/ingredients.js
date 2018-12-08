const express = require('express');
const router = express.Router();
var database = require('../public/javascripts/database');
const Ingredient = require('../public/javascripts/models/ingredient.js');
const Recipe = require('../public/javascripts/models/recipe.js');

const RecipeModel = require('../public/javascripts/mongoose/RecipeSchema');
const IngredientModel = require('../public/javascripts/mongoose/IngredientSchema');
const UserModel = require('../public/javascripts/mongoose/UserSchema');

const listIngredients = [];
listIngredients.push(new Ingredient("Tomato Sauce", "plat", "lunch", "100", 1, ["tomato", "sauce", "bolognaise", "provençale"], "0123456789"));
listIngredients.push(new Ingredient("Pesto Sauce", "plat", "lunch", "100", 1, ["sauce", "pesto"], "0123456789"));
listIngredients.push(new Ingredient("Pasta", "plat", "lunch", "100", 1, ["pasta", "pates", "pâtes", "spaghetti", "torti"], "0123456789"));

router.get('/search/keyword/:keyword', function (req, res) {
    console.log("GET Request : keyword: " + req.params.keyword);

    var keyword_ = req.params.keyword;

    IngredientModel.find({
        keywords: keyword_
    }).then(doc => {
        console.log("\nDOCUMENT FOUND");
        console.log(doc);
        console.log("\n");
        res.send(doc);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });
});

router.get('/search/id/:id', function (req, res) {
    console.log("GET Request : keyword: " + req.params.id);


    IngredientModel.findById(req.params.id).then(doc => {
        console.log("\nDOCUMENT FOUND");
        console.log(doc);
        console.log("\n");
        res.send(doc);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });
});

router.post('/add/:token', function(req, res) {
    //var result = JSON.stringify(req.body);

    console.log("\nPOST request: ");

    let ingredientToAdd = new IngredientModel({
        name: listIngredients[0].name,
        typeDish: listIngredients[0].typeDish,
        typeMeal: listIngredients[0].typeMeal,
        weight: listIngredients[0].weight,
        quantity: listIngredients[0].quantity,
        keywords: listIngredients[0].keywords,
        barCode: listIngredients[0].barCode
    });

    ingredientToAdd.save()
        .then(doc => {
            console.log("\nINGREDIENT INSERTION SUCCESSED");
            console.log(doc);
        }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});


router.post('/create', function(req, res) {


    console.log("\nPOST request: ");
    
    //must parse the array first
    var kwds;
    try {    
    const kwds = JSON.parse(req.query.keywordsarray)
    }
		catch(err){
			console.log(err)
		}

    let ingredientToAdd = new IngredientModel({
        name: req.query.name,
        typeDish: req.query.typeDish,
        typeMeal: req.query.typeMeal,
        weight: req.query.weight,
        quantity: req.query.quantity,
        keywords: kwds,
        barCode: req.query.barCode
    });

    ingredientToAdd.save()
        .then(doc => {
            console.log("\nINGREDIENT Created SUCCESSED");
            console.log(doc);
            res.send(doc)
        }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

router.get('/delete/id/:id', function(req, res) {

    IngredientModel
        .findOneAndRemove({
            _id: req.params.id
        }).then(response => {
        console.log("\nDOCUMENT DELETED");
        console.log("\n");
        res.send(response);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });

});

router.get('/delete/keyword/:keyword', function(req, res) {

    IngredientModel
        .deleteMany({
            keywords: req.params.keyword
        }).then(response => {
        console.log("\nDOCUMENT(S) DELETED");
        console.log("\n");
        res.send(response);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });

});

router.post('/modify/', function(req, res) {

    console.log("\nPOST request: ");
    console.log(result);

    IngredientModel
        .findOneAndUpdate(
            {
                _id: req.body._id                // search query
            },
            {
                name: req.body.name,             // field:values to update
                typeDish: req.body.typeDish,
                typeMeal: req.body.typeMeal,
                weight: req.body.weight,
                quantity: req.body.quantity,
                keywords: req.body.keywords
            },
            {
                new: true,                       // return updated doc
                runValidators: true              // validate before update
            })
        .then(doc => {
            console.log(doc);
            res.send(doc);
        })
        .catch(err => {
            console.error(err);
            res.send("{}");
        });
});

module.exports = router;


