class user {

    constructor(name) {
        this.name = name;
        this.token = this.generateToken();
    }

    generateToken() {
        return this.hashCode(this.name + new Date().getTime());
    }

    hashCode(stringToHash){
        console.log("Data to be hashed: " + stringToHash);
        // Source : https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
        var hash = 0;
        if (stringToHash.length === 0) return hash;
        for (var i = 0; i < stringToHash.length; i++) {
            var char = stringToHash.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }

        console.log("Data hashed: " + hash);
        return Math.abs(hash);
    };


    toString() {
        return 'name: ' + this.name +
            '\ntoken: ' +  this.token
    }
}

module.exports = user;