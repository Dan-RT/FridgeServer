const express = require('express');
const router = express.Router();
var database = require('../public/javascripts/database');
const Ingredient = require('../public/javascripts/models/ingredient.js');
const Recipe = require('../public/javascripts/models/recipe.js');

const RecipeModel = require('../public/javascripts/mongoose/RecipeSchema');
const IngredientModel = require('../public/javascripts/mongoose/IngredientSchema');
const FridgeListModel = require('../public/javascripts/mongoose/FridgeListSchema');

const recipe = require('../public/javascripts/models/recipe.js');

const listIngredients = [];
listIngredients.push(new Ingredient("Tomato Sauce", "plat", "lunch", "100", 1, ["tomato", "sauce", "bolognaise", "provençale"], "100000"));
listIngredients.push(new Ingredient("Pesto Sauce", "plat", "lunch", "100", 1, ["sauce", "pesto"], "100001"));
listIngredients.push(new Ingredient("Pasta", "plat", "lunch", "100", 1, ["pasta", "pates", "pâtes", "spaghetti", "torti"]), "100002");

var helper = require("../public/javascripts/helpers.js");

insertFridgeList = function (res, token, barCodeIngredientToAdd) {

    console.log("insertFridgeList: " + token);

    FridgeListModel.find({
        tokenUser: token
    }).then(doc => {

        if (doc.length > 0) {
            //Si la liste existe

            console.log("\nLIST FOUND");
            console.log(doc);

            var list = doc[0].toObject();
            list.ingredients.push(barCodeIngredientToAdd);

            FridgeListModel
                .findOneAndUpdate(
                    {
                        _id: list._id
                    },
                    {
                        ingredients: list.ingredients
                    },
                    {
                        new: true,
                        runValidators: true
                    })
                .then(doc => {
                    if (doc.length > 0) {
                        console.log(doc);
                        console.log("\nFRIDGE LIST UPDATED");
                        res.send(doc);
                    }
                }).catch(err => {
                    console.error(err);
            });

        }
        else {
            //Sinon on crée la liste

            var ingredientTmp = [barCodeIngredientToAdd];

            let FridgeListToAdd = new FridgeListModel({
                tokenUser: token,
                ingredients: ingredientTmp,
                groceries: []
            });

            FridgeListToAdd.save()
                .then(doc => {
                    console.log("\nFRIDGE LIST CREATION SUCCESSED");
                    console.log(doc);
                    res.send(doc);
                }).catch(err => {
                console.error(err);
            });
        }
    }).catch(err => {
        console.error(err);
    });
};

updateQuantity = function (res, token, add, barCode, quantity) {

    console.log("updateQuantity");
    console.log("barCode: " + barCode);

    FridgeListModel.find({
        tokenUser: token
    }).then(doc => {
        if (doc.length > 0) {
            console.log("\nFRIDGE LIST FOUND");
            console.log(doc[0]);

            IngredientModel.find({
                barCode: String(barCode)
            }).then(doc_ingr => {
                console.log(doc_ingr);
                if (doc_ingr.length > 0) {
                    console.log("\nINGREDIENT FOUND");
                    //console.log(doc_ingr[0]);

                    if (add === true) {
                        doc_ingr[0].quantity += parseInt(quantity);
                    } else {
                        doc_ingr[0].quantity -= parseInt(quantity);
                    }

                    IngredientModel.findOneAndUpdate(
                            {
                                barCode: barCode
                            },
                            {
                                quantity: doc_ingr[0].quantity
                            },
                            {
                                new: true,
                                runValidators: true
                            })
                    .then(doc => {
                        console.log(doc);
                        console.log("\nINGREDIENT UPDATED");

                        res.send(doc);

                    }).catch(err => {
                        console.error(err);
                        console.log("\nFRIDGE INGREDIENT LIST NOT UPDATED");
                        res.send("{error:\"FRIDGE INGREDIENT LIST NOT UPDATED\"}");
                    });

                } else {
                    console.log("\nINGREDIENT NOT FOUND");
                    res.send("{error:\"INGREDIENT NOT FOUND\"}");
                }
            }).catch(err => {
                console.error(err);
                res.send("{error:\"unknown\"}");
            });
        } else {
            console.log("\nFRIDGE LIST NOT FOUND");
            res.send("{error:\"FRIDGE NOT FOUND\"}");
        }
    }).catch(err => {
        console.error(err);
    });
};

sendBackFridge = function (res, fridge, index) {
    fridge.ingredients.splice(index, 1);

    console.log("List:");
    console.log(fridge.ingredients);

    FridgeListModel
        .findOneAndUpdate(
            {
                _id: fridge._id
            },
            {
                ingredients: fridge.ingredients,
                groceries: fridge.groceries
            },
            {
                new: true,
                runValidators: true
            })
        .then(doc => {
            console.log(doc);
            console.log("\nFRIDGE LIST UPDATED");

            var ingredientArray = [];
            asyncLoop(res, 0, doc.ingredients, ingredientArray, function (ingredientArray) {
                res.send(ingredientArray);
            });

        }).catch(err => {
        console.error(err);
    });
};

function asyncLoop(res, i, ingredientBarCodes, ingredientArray, callback) {
    try {
        if(i < ingredientBarCodes.length) {
            console.log(i);
            console.log(ingredientBarCodes[i]);

            IngredientModel.find({
                barCode: String(ingredientBarCodes[i])
            }).then(doc => {
                console.log("\nINGREDIENT FOUND");
                console.log(doc);
                if (doc[0] !== undefined) {
                    ingredientArray.push(doc[0].toObject());
                    asyncLoop(res, i+1, ingredientBarCodes, ingredientArray, callback);
                } else {
                    throw new Error('RECIPE NOT FOUND');
                }

            }).catch(err => {
                console.error(err);
                res.send("Error:\"RECIPE NOT FOUND\"");
            });

        } else {
            callback(ingredientArray);
        }
    } catch (e) {
        console.log(e);
        callback(null);
    }
}

//GET contenu frigo by token
//tested
router.get('/search/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);
    //console.log(result);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");
                console.log(doc[0]);
                res.send(doc[0]);
            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
        });
    });
});

//POST new ingredient
//tested
router.post('/ingredient/add/token/:token', function(req, res) {

    console.log("\nPOST request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {

        let ingredientToAdd = new IngredientModel({
            name: listIngredients[1].name,
            typeDish: listIngredients[1].typeDish,
            typeMeal: listIngredients[1].typeMeal,
            weight: listIngredients[1].weight,
            quantity: listIngredients[1].quantity,
            keywords: listIngredients[1].keywords,
            barCode: listIngredients[1].barCode
        });

        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("Ingredient verification");
                console.log(doc[0].ingredients);
                var inFridge = false;

                for (var i = 0; i < doc[0].ingredients.length; i++) {
                    //ATTENTION À CHANGER ÉGALEMENT QUAND ON SUPPRIME LE STATIQUE
                    if (doc[0].ingredients[i] === String(listIngredients[1].barCode)) {
                        inFridge = true;
                        console.log("Ingredient already in fridge.");
                        updateQuantity(res, token, true, listIngredients[1].barCode, listIngredients[1].quantity);
                        break
                    }
                }
            }

            if (!inFridge) {
                ingredientToAdd.save()
                    .then(doc => {
                        console.log("\nINGREDIENT INSERTION SUCCESSED");
                        console.log(doc);

                        var barCode = doc.toObject().barCode;
                        insertFridgeList(res, token, barCode);
                    }).catch(err => {
                    console.error(err);
                    res.send("{error:true}");
                });
            }

        }).catch(err => {
            console.error(err);
            res.send("{error:true}");
        });
    });
});

//ADD - increase quantity
//tested
router.get('/add/barCode/:barCode/quantity/:quantity/token/:token', function(req, res) {
    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var barCode = req.params.barCode;
    console.log("\ntoken: " + barCode);

    var quantity = req.params.quantity;
    console.log("\nquantity: " + quantity);

    helper.authentification(res, token, function () {
        updateQuantity(res, token, true, barCode, quantity);
    });
});

//SUB - increase quantity
//tested
router.get('/sub/barCode/:barCode/quantity/:quantity/token/:token', function(req, res) {
    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var barCode = req.params.barCode;
    console.log("\ntoken: " + barCode);

    var quantity = req.params.quantity;
    console.log("\nquantity: " + quantity);

    helper.authentification(res, token, function () {
        updateQuantity(res, token, false, barCode, quantity);
    });
});

//DELETE ingredient from fridge by token
//tested
router.get('/ingredient/remove/barCode/:barCode/groceries/:groceries/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var barCode = req.params.barCode;
    console.log("\nbarCode: " + barCode);

    var saveToGroceries = (req.params.groceries === "true");
    console.log(saveToGroceries);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");
                console.log(doc);

                var fridge = doc[0].toObject();
                let list = fridge.ingredients;
                let index = -1;

                for(var i = 0; i < list.length; i++){
                    if (list[i] === barCode) {
                        index = i;
                        break;
                    }
                }

                if (index >= 0) {
                    if (saveToGroceries === false) {
                        IngredientModel.findOneAndRemove({
                            barCode: barCode
                        }).then(response => {
                            sendBackFridge(res, fridge, index);
                        }).catch(err => {
                            console.error(err);
                            res.send("{error:\"FAILED TO REMOVE INGREDIENT\"}");
                        });
                    } else {
                        fridge.groceries.push(fridge.ingredients[index]);
                        sendBackFridge(res, fridge);
                    }

                } else {
                    res.send("{ingredientNotFound:true}")
                }
            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
        });
    });
});

//DELETE fridge by token
//tested
router.get('/delete/token/:token', function(req, res) {

    FridgeListModel
        .findOneAndRemove({
            tokenUser: req.params.token
        }).then(response => {
        console.log("\nFridge DELETED");
        console.log("\n");
        res.send(response);
    }).catch(err => {
        console.error(err);
        res.send("{}");
    });

});

//REMOVE ingredient from grocery list by barCode
//tested
router.get('/remove/groceries/barCode/:barCode/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    var barCode = req.params.barCode;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");

                var fridge = doc[0].toObject();
                let list = fridge.groceries;
                let index = -1;

                for(var i = 0; i < list.length; i++){
                    if (list[i] === barCode) {
                        index = i;
                        break;
                    }
                }

                if (index >= 0) {
                    fridge.groceries.splice(index, 1);

                    console.log("Groceries:");
                    console.log(fridge.groceries);

                    IngredientModel
                        .findOneAndRemove({
                            barCode: barCode
                        }).then(response => {
                        FridgeListModel
                            .findOneAndUpdate(
                                {
                                    _id: fridge._id
                                },
                                {
                                    groceries: fridge.groceries
                                },
                                {
                                    new: true,
                                    runValidators: true
                                })
                            .then(doc => {
                                console.log(doc);
                                console.log("\nGROCERY LIST UPDATED");
                                var ingredientArray = [];
                                asyncLoop(res, 0, doc.groceries, ingredientArray, function (ingredientArray) {
                                    res.send(ingredientArray);
                                });

                            }).catch(err => {
                            console.error(err);
                        });

                    }).catch(err => {
                        console.error(err);
                        res.send("{}");
                    });
                } else {
                    console.log("\nINGREDIENT NOT FOUND");
                    res.send("{ingredientNotFound:true}");
                }
            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
        });
    });
});

//GET groceries by token
//tested
router.get('/search/groceries/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");
                console.log(doc);

                console.log("\n\nGROCERIES LIST");
                console.log(doc[0].groceries);

                var ingredientArray = [];
                asyncLoop(res, 0, doc[0].groceries, ingredientArray, function (ingredientArray) {
                    if (ingredientArray) {
                        console.log(ingredientArray);
                        res.send(ingredientArray);
                    } else {
                        res.send("[]");
                    }
                });

            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
            res.send("{error:true}")
        });
    });
});

//GET all ingredients from fridge
//tested
router.get('/fetchAllFridge/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");

                var fridge = doc[0].toObject();
                var ingredientArray = [];

                asyncLoop(res, 0, fridge.ingredients, ingredientArray, function (ingredientArray) {
                    console.log(ingredientArray);
                    res.send(ingredientArray);
                });

            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
            res.send("{listNotFound:true}");
        });
    });
});


var listRecipes = [];
listRecipes.push(new recipe("FTYGUHIOP987T6TFYH", "Pâtes Bolo",
    [
        "100000",
        "100001"
    ], ["test", "tomato", "pates"], "test description"
    )
);


//ADD recipes to fridge
//tested
router.post('/recipes/add/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var id = listRecipes[0].idAPI;

    let recipeToAdd = new RecipeModel({
        idAPI: listRecipes[0].idAPI,
        name: listRecipes[0].name,
        ingredientsBarcode: listRecipes[0].ingredientsBarcode,
        keywords: listRecipes[0].keywords,
        description: listRecipes[0].description
    });

    helper.authentification(res, token, function () {

        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                var fridge = doc[0];

                fridge.recipes.push(id);

                FridgeListModel
                    .findOneAndUpdate(
                        {
                            _id: fridge.id
                        },
                        {
                            recipes: fridge.recipes
                        },
                        {
                            new: true,
                            runValidators: true
                        })
                    .then(doc => {
                        console.log(doc);
                        console.log("\nFRIDGE RECIPES UPDATED");

                        recipeToAdd.save()
                            .then(doc => {
                                console.log("\nRECUPE ADDED TO DB");
                                res.send(doc);
                            }).catch(err => {
                                console.error(err);
                                res.send("{error:\"FAILED TO ADD RECIPE TO DB\"}");
                            });

                    }).catch(err => {
                        console.error(err);
                        res.send("{error:\"RECIPES NOT UPDATED\"}");
                    });

            } else {
                console.log("\nFRIDGE NOT FOUND");
                res.send("{error:\"FRIDGE NOT FOUND\"}");
            }
        }).catch(err => {
            console.error(err);
            res.send("{error:\"unknown\"}");
        });
    });
});

//DELETE recipes from fridge
//tested
router.get('/recipes/delete/id/:id/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var id = req.params.id;
    console.log("\nid recette: " + id);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                var fridge = doc[0];
                var index = -1;

                var flag = false;
                for (let i = 0; i < fridge.recipes.length; i++) {
                    if (id === String(fridge.recipes[i])) {
                        index = i;
                        console.log("recette found at index: " + index);
                        flag = true;
                        break;
                    }
                }

                if(flag) {
                    fridge.recipes.splice(index, 1);

                    FridgeListModel
                        .findOneAndUpdate(
                            {
                                _id: fridge.id
                            },
                            {
                                recipes: fridge.recipes
                            },
                            {
                                new: true,
                                runValidators: true
                            })
                        .then(doc => {
                            console.log(doc);
                            console.log("\nFRIDGE RECIPES UPDATED");

                            res.send(doc);
                        }).catch(err => {
                        console.error(err);
                        res.send("{error:\"RECIPES NOT UPDATED\"}");
                    });
                } else {
                    console.log("\nRECIPE NOT FOUND");
                    res.send("{error:\"RECIPE NOT FOUND\"}");
                }
            } else {
                console.log("\nFRIDGE NOT FOUND");
                res.send("{error:\"FRIDGE NOT FOUND\"}");
            }
        }).catch(err => {
            console.error(err);
            res.send("{error:\"unknown\"}");
        });
    });
});

router.get('/recipes/fetchAll/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    helper.authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {

                console.log(doc[0]);
                res.send(doc[0].recipes);

            } else {
                console.log("\nFRIDGE NOT FOUND");
                res.send("{error:\"FRIDGE NOT FOUND\"}");
            }
        }).catch(err => {
            console.error(err);
            res.send("{error:\"unknown\"}");
        });
    });
});

module.exports = router;