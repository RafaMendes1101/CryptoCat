var express = require("express");
var router = express.Router({mergeParams: true});
var Coin = require("../models/coins");
var bodyParser = require("body-parser");
var Comment = require("../models/comment");
//===============
//comments routes
//===============
router.get("/new", isLoggedIn, (req,res) => {
	Coin.findById(req.params.id, (err, coin) => {		
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

router.post("/", isLoggedIn, (req, res) => {
	Coin.findById(req.params.id, (err, coin) => {
		if(err){
			console.log(err)
			res.redirect("/coins");
		}else{
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

// EDIT ROUTE
router.get("/:comment_id/edit",chkCommentOwner, (req,res) =>{
	Comment.findById(req.params.comment_id, (err, foundComment)=>{
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {coin_id: req.params.id, comment: foundComment});
		}
	})
});

// UPDATE ROUTE
router.put("/:comment_id",chkCommentOwner, (req,res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err,updatedComment)=>{
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/coins/" + req.params.id);
		}
	});
});

router.delete("/:comment_id",chkCommentOwner, (req,res)=>{
	Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/coins/" + req.params.id);
		}
	})
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


function chkCommentOwner(req,res, next){
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
module.exports = router;