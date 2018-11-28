const express = require('express');
const router = express.Router();
var database = require('../public/javascripts/database');
const Ingredient = require('../public/javascripts/models/ingredient.js');
const Recipe = require('../public/javascripts/models/recipe.js');

const RecipeModel = require('../public/javascripts/mongoose/RecipeSchema');
const IngredientModel = require('../public/javascripts/mongoose/IngredientSchema');
const UserModel = require('../public/javascripts/mongoose/UserSchema');
const FridgeListModel = require('../public/javascripts/mongoose/FridgeListSchema');


const listIngredients = [];
listIngredients.push(new Ingredient("Tomato Sauce", "plat", "lunch", "100", 1, ["tomato", "sauce", "bolognaise", "provençale"]));
listIngredients.push(new Ingredient("Pesto Sauce", "plat", "lunch", "100", 1, ["sauce", "pesto"]));
listIngredients.push(new Ingredient("Pasta", "plat", "lunch", "100", 1, ["pasta", "pates", "pâtes", "spaghetti", "torti"]));


insertFridgeList = function (res, token, idIngredientToAdd) {

    console.log("insertFridgeList: " + token);

    FridgeListModel.find({
        tokenUser: token
    }).then(doc => {

        if (doc.length > 0) {
            //Si la liste existe

            console.log("\nLIST FOUND");
            console.log(doc);

            var list = doc[0].toObject();
            list.ingredients.push(idIngredientToAdd);

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
                    console.log(doc);
                    console.log("\nFRIDGE LIST UPDATED");
                    res.send(doc);
                }).catch(err => {
                console.error(err);
            });

        }
        else {
            //Sinon on crée la liste

            var ingredientTmp = [idIngredientToAdd];

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

authentification = function (res, token, callback) {
    UserModel.find({
        token: token
    }).then(doc => {
        if (doc.length === 0) {
            throw Error('USER NOT AUTHORIZED');
        } else {
            console.log("\nUSER AUTHORIZED FOUND");
            console.log(doc);
            callback(res, token);
        }
    }).catch(err => {
        console.log("\nUSER NOT AUTHORIZED");
        res.send("{notAuthorized:true}");
    });
};

function asyncLoop(i, ingredientIds, ingredientArray, callback) {
    if(i < ingredientIds.length) {
        console.log(i);

        IngredientModel.findById(ingredientIds[i]).then(doc => {
            console.log("\nINGREDIENT FOUND");
            console.log(doc);

            ingredientArray.push(doc.toObject());

            asyncLoop(i+1, ingredientIds, ingredientArray, callback);
        }).catch(err => {
            console.error(err);
        });

    } else {
        callback(ingredientArray);
    }
}


router.post('/ingredient/add/token/:token', function(req, res) {

    console.log("\nPOST request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    authentification(res, token, function () {

        let ingredientToAdd = new IngredientModel({
            name: listIngredients[0].name,
            typeDish: listIngredients[0].typeDish,
            typeMeal: listIngredients[0].typeMeal,
            weight: listIngredients[0].weight,
            quantity: listIngredients[0].quantity,
            keywords: listIngredients[0].keywords
        });

        ingredientToAdd.save()
            .then(doc => {
                console.log("\nINGREDIENT INSERTION SUCCESSED");
                console.log(doc);

                var id = doc.toObject()._id;
                insertFridgeList(res, token, id);
            }).catch(err => {
            console.error(err);
            res.send("{error:true}");
        });
    });
});

router.get('/search/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);
    //console.log(result);

    authentification(res, token, function () {
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

router.get('/ingredient/remove/id/:id/groceries/:groceries/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    var id = req.params.id;
    console.log("\nid: " + id);

    var saveToGroceries = req.params.groceries;
    console.log("\nsaveToGroceries: " + saveToGroceries);

    authentification(res, token, function () {
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
                    if (list[i] == id) {
                        index = i;
                        break;
                    }
                }

                if (index >= 0) {
                    if (saveToGroceries) {
                        fridge.groceries.push(fridge.ingredients[index]);
                    }

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
                            asyncLoop(0, doc.ingredients, ingredientArray, function (ingredientArray) {
                                res.send(ingredientArray);
                            });

                        }).catch(err => {
                        console.error(err);
                    });
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

router.get('/remove/groceries/id/:id/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");

                var fridge = doc[0].toObject();
                let list = fridge.groceries;
                let index = -1;

                for(var i = 0; i < list.length; i++){
                    if (list[i] == req.params.id) {
                        index = i;
                        break;
                    }
                }

                if (index >= 0) {
                    fridge.groceries.splice(index, 1);

                    console.log("Groceries:");
                    console.log(fridge.groceries);

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
                            asyncLoop(0, doc.groceries, ingredientArray, function (ingredientArray) {
                                res.send(ingredientArray);
                            });

                        }).catch(err => {
                        console.error(err);
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

router.get('/search/groceries/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");
                console.log(doc);

                var ingredientArray = [];
                asyncLoop(0, doc.groceries, ingredientArray, function (ingredientArray) {
                    console.log(ingredientArray);
                    res.send(ingredientArray);
                });

            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
        });
    });
});

router.get('/fetchAllFridge/token/:token', function(req, res) {

    console.log("\nGET request: ");
    var token = req.params.token;
    console.log("\ntoken: " + token);

    authentification(res, token, function () {
        FridgeListModel.find({
            tokenUser: token
        }).then(doc => {
            if (doc.length > 0) {
                console.log("\nFRIDGE LIST FOUND");

                var fridge = doc[0].toObject();
                var ingredientArray = [];

                asyncLoop(0, fridge.ingredients, ingredientArray, function (ingredientArray) {
                    console.log(ingredientArray);
                    res.send(ingredientArray);
                });

            } else {
                console.log("\nFRIDGE LIST NOT FOUND");
                res.send("{listNotFound:true}");
            }
        }).catch(err => {
            console.error(err);
        });
    });
});

module.exports = router;