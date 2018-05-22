var mongoose = require("mongoose");


var coinSchema = new mongoose.Schema({
	name: String,
	acronym: String,
	icon: String,
	description: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "comment"
		}
	]
});

module.exports = mongoose.model("coins", coinSchema);

