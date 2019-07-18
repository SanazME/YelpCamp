var mongoose              = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username : String,
    password : String
})

// Add passport-local-monogoose methods to the User so we can use User.serialize() and 
// User.deserialize() methods on the User
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);