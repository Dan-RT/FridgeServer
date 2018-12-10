const express = require('express');
const router = express.Router();
var database = require('../public/javascripts/database');
const ingredient = require('../public/javascripts/models/ingredient.js');
const recipe = require('../public/javascripts/models/recipe.js');

const RecipeModel = require('../public/javascripts/mongoose/RecipeSchema');
const IngredientModel = require('../public/javascripts/mongoose/IngredientSchema');
var helper = require("../public/javascripts/helpers.js");

const listRecipes = [];


listRecipes.push(new recipe("Pâtes Bolo",
                                [
                                    "100000",
                                    "100001"
                                ], ["test", "tomato", "pates"], "test description"
                            )
                );

listRecipes.push(new recipe("Pâtes Pesto",
                                [
                                    "100001",
                                    "100000"
                                ], ["test", "tomato", "pates"], "test description"
                            )
                );
listRecipes.push(new recipe("Soupe de tomate",
                                [
                                    "100000"
                                ], ["soupe", "soup"],  "test description"
                            )
                );


router.get('/search/keyword/:keyword/token/:token', function (req, res) {

    var token = req.params.token;
    console.log("GET Request : keyword: " + req.params.keyword);
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        var keyword_ = req.params.keyword;

        RecipeModel.find({
            keywords: keyword_
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nRECIPE FOUND");
                console.log(doc[0]);
                console.log("\n");
                res.send(doc[0]);
            } else {
                throw new Error('RECIPE NOT FOUND');
            }
        }).catch(err => {
            console.error(err);
            res.send("{error:\"RECIPE NOT FOUND\"}");
        });
    });
});

router.get('/search/id/:id', function (req, res) {
    console.log("GET Request : keyword: " + req.params.id);

    var id = req.params.id;

    RecipeModel.findById(id).then(doc => {
        console.log("\nDOCUMENT FOUND");
        console.log(doc);
        console.log("\n");
        res.send(doc);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });
});

function asyncLoop(i, ingredientArray, keywordsIngredients, callback) {
    if(i < ingredientArray.length) {
        console.log(i);

        IngredientModel.find({
            barCode: String(ingredientArray[i])
        }).then(doc => {
            //console.log(doc);
            if (doc.length > 0) {
                console.log("\nINGREDIENT FOUND");
                //console.log(doc);
                console.log("\nKeyword current ingredients:");


                var keywordsTmp = doc[0].toObject().keywords;
                console.log(keywordsTmp);

                if (keywordsIngredients.length === 0) {
                    keywordsIngredients = keywordsTmp.slice();
                } else {
                    keywordsIngredients = keywordsIngredients.concat(keywordsTmp);
                }

                console.log("\nKeyword total:");
                console.log(keywordsIngredients);


            } else {
                console.log("\nINGREDIENT NOT FOUND");
            }
            asyncLoop(i+1, ingredientArray, keywordsIngredients, callback);

        }).catch(err => {
            console.error(err);
            res.send("error:\"INGREDIENT NOT FOUND\"");
        });

    } else {
        callback(keywordsIngredients);
    }
}

router.post('/add/token/:token', function(req, res) {
    // Source : https://stackoverflow.com/questions/21829789/node-mongoose-find-query-in-loop-not-working/21830088

    var token = req.params.token;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        var result = JSON.stringify(req.body);

        console.log(listRecipes[0]);
        console.log("\nPOST request: ");
        //console.log(result);

        var keywordsIngredients = [];

        console.log("BLABLABLA");

        asyncLoop(0, listRecipes[0].ingredientsBarcode, keywordsIngredients, function(keywordsIngredients) {
            //code that should happen after the loop

            console.log("\nKeywords of the new Recipe:");
            console.log(keywordsIngredients);

            let recipeToAdd = new RecipeModel({
                name: listRecipes[0].name,
                ingredients: listRecipes[0].ingredientsBarcode,
                keywords: keywordsIngredients,
                description: listRecipes[0].description
            });

            recipeToAdd.save()
                .then(doc => {
                    console.log("\nINSERTION SUCCESSED");
                    console.log(doc);
                    console.log("\n");
                    res.send(doc);
                }).catch(err => {
                console.error(err);
                res.send("{error:true}");
            });
        });
    });

});

router.get('/delete/id/:id', function(req, res) {

    var token = req.params.token;
    console.log("GET Request : keyword: " + req.params.keyword);
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        RecipeModel
            .findById(req.params.id).then(response => {
            console.log("\nDOCUMENT DELETED");
            console.log("\n");
            res.send(response);
        }).catch(err => {
            console.error(err);
            res.send("{}");
        });
    });
});

router.post('/modify/', function(req, res) {

    console.log("\nPOST request: ");
    console.log(result);

    RecipeModel
        .findOneAndUpdate(
            {
                _id: req.body._id                // search query
            },
            {
                name: req.body.name,
                ingredients: req.body.ingredients,
                keywords: req.body.keywords,
                description: req.body.description
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
