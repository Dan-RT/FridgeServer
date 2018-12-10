const UserModel = require('./mongoose/UserSchema');

exports.authentification = function (res, token, callback) {
    UserModel.find({
        token: token
    }).then(doc => {
        console.log(doc);
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


