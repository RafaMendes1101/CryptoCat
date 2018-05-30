var mongoose = require("mongoose");


var coinSchema = new mongoose.Schema({
	count: Number,
	name: String,
	acronym: String,
	icon: String,
	description: String,
	video: String,
	author:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user"
		},
		username: String
	},
	comments: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "comment"
	}
	]
});

module.exports = mongoose.model("coins", coinSchema);

