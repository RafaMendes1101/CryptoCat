var middlewareObj = {};
var Coin = require("../models/coins");
var Comment = require("../models/comment");
var User = require("../models/user");

middlewareObj.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Login First");
	res.redirect("/login");
}


middlewareObj.chkPostOwner = function (req,res, next){
	if(req.isAuthenticated()){
		Coin.findById(req.params.id, (err, foundCoin)=>{
			if(err || !foundCoin) {
				req.flash("error", "Post not found");
				res.redirect("back");
			} else {
				if(foundCoin.author.id.equals(req.user._id)){
					return next();
				}else {
					res.send("You can only edit your own posts");
				}
			}
		});
	} else {
		res.redirect("/login");
	}
}

middlewareObj.chkCommentOwner = function (req,res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err || !foundComment) {
				req.flash("error", "Comment not found");
				res.redirect("/coins/:id");
			} else {
				if(foundComment.author.id.equals(req.user._id)){
					return next();
				}else {
					req.flash("error","You can only edit/delete your own comments");
				}
			}
		});
	} else {
		req.flash("error", "Login first.");
		res.redirect("/login");
	}
}

module.exports = middlewareObj; 