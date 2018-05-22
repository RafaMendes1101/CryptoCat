var mongoose = require("mongoose");


var coinSchema = new mongoose.Schema({
	name: String,
	acronym: String,
	icon: String,
	description: String
});

module.exports = mongoose.model("Coins", coinSchema);