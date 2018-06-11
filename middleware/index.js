var middlewareObj = {};
var Coin = require("../models/coins");
var Comment = require("../models/comment");

middlewareObj.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


middlewareObj.chkPostOwner = function (req,res, next){
	if(req.isAuthenticated()){
		Coin.findById(req.params.id, (err, foundCoin)=>{
			if(err) res.redirect("back");
			if(foundCoin.author.id.equals(req.user._id)){
				return next();
			}else {
				res.send("You can only edit your own posts");
			}
		});
	} else {
		res.redirect("/login");
	}
}

middlewareObj.chkCommentOwner = function (req,res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err) res.redirect("/coins/:id");
			if(foundComment.author.id.equals(req.user._id)){
				return next();
			}else {
				res.send("You can only edit/delete your own comments");
			}
		});
	} else {
		res.redirect("/login");
	}
}

module.exports = middlewareObj; 