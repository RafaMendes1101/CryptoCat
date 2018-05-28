var mongoose = require("mongoose");
var passportLocal = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	email: String
});

userSchema.plugin(passportLocal); // enables the authentication methods to user model

module.exports = mongoose.model("Users", userSchema);