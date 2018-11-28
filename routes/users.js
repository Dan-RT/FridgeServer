const express = require('express');
const router = express.Router();

const user = require('../public/javascripts/models/user.js');
const UserModel = require('../public/javascripts/mongoose/UserSchema');
const FridgeListModel = require('../public/javascripts/mongoose/FridgeListSchema');

router.get('/create/name/:name', function(req, res) {
    console.log("GET create User: " + req.params.name);

    var newUser = new user(req.params.name);

    let userToAdd = new UserModel({
        name: newUser.name,
        token: newUser.token
    });

    userToAdd.save()
        .then(doc => {
            console.log("\nUSER INSERTION SUCCESSED");
            console.log(doc);
            console.log("\n");
            res.send(doc);
        }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

router.get('/search/name/:name', function (req, res) {

    console.log("GET search User: " + req.params.name);

    UserModel.find({
        name: req.params.name
    }).then(doc => {
        console.log("\nUSER FOUND BY NAME");
        console.log(doc);
        console.log("\n");
        res.send(doc[0]);
    }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

router.get('/search/id/:id', function(req, res) {

    console.log("GET search User: " + req.params.id);

    UserModel.findById(req.params.id).then(doc => {
        console.log("\nUSER FOUND BY ID");
        console.log(doc);
        console.log("\n");
        res.send(doc);
    }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });

});

router.get('/search/token/:token', function (req, res) {

    console.log("GET search User: " + req.params.token);

    UserModel.find({
        token: req.params.token
    }).then(doc => {
        console.log("\nUSER FOUND BY TOKEN");
        console.log(doc[0]);
        console.log("\n");
        res.send(doc[0]);
    }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

router.get('/delete/name/:name', function(req, res) {

    console.log("GET delete User: " + req.params.name);

    UserModel
        .findOneAndRemove({
            name: req.params.name
        }).then(doc => {
        console.log("\nUSER DELETED");
        console.log(doc);
        res.send(doc);
    }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

router.get('/delete/token/:token', function(req, res) {

    console.log("GET delete User: " + req.params.token);

    UserModel
        .findOneAndRemove({
            token: req.params.token
        }).then(response => {
        console.log("\nUSER DELETED");
        console.log("\n");

        FridgeListModel
            .findOneAndRemove({
                tokenUser: req.params.token
            }).then(doc => {
            console.log("\nFRIDGE DELETED");
            console.log(doc);
        }).catch(err => {
            //console.error(err);
        });

        res.send(response);
    }).catch(err => {
        console.error(err);
        res.send("{error:true}");
    });
});

module.exports = router;