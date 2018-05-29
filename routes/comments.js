var express = require("express");
var router = express.Router({mergeParams: true});
var Coin = require("../models/coins");
var Comment = require("../models/comment");
//===============
//comments routes
//===============
router.get("/coins/:acronym/comments/new", isLoggedIn, (req,res) => {
	Coin.findOne({acronym: req.params.acronym}, (err, coin) => {
		//console.log(coin)
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

router.post("/coins/:acronym/comments", isLoggedIn, (req, res) => {
	Coin.findOne({acronym: req.params.acronym}, (err, coin) => {
		if(err){
			console.log(err)
			res.redirect("/coins");
		}else{
		//	console.log(req.body.comment);
		Comment.create(req.body.comment, (err,comment) => {
			if(err){				
				res.redirect("/coins/:acronym");
			}else{
				coin.comments.push(comment);
				coin.save();
				res.redirect("/coins/" + coin.acronym);
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