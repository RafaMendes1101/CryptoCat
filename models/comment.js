var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
	text: String,
	author: {
		id: { //reference to user model id
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	},
	username: String // currente user
}
});
module.exports =  mongoose.model("comment", commentSchema);

