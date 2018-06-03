var express = require("express");
var router = express.Router({mergeParams: true});
var Coin = require("../models/coins");
var bodyParser = require("body-parser");
var Comment = require("../models/comment");
//===============
//comments routes
//===============
router.get("/coins/:id/comments/new", isLoggedIn, (req,res) => {
	Coin.findById(req.params.id, (err, coin) => {
		//console.log(coin)
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

router.post("/coins/:id/comments", isLoggedIn, (req, res) => {
	Coin.findById(req.params.id, (err, coin) => {
		if(err){
			console.log(err)
			res.redirect("/coins");
		}else{
		//	console.log(req.body.comment);
		Comment.create(req.body.comment, (err,comment) => {
			if(err){				
				res.redirect("/coins/:id");
			}else{
				comment.author.id = req.user.id; 
				comment.author.username = req.user.username;
				comment.save();
				coin.comments.push(comment);
				coin.save();
				res.redirect("/coins/" + coin.id);
			}
		});
	}
});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
module.exports = router;