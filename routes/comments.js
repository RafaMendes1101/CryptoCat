var express = require("express");
var router = express.Router({mergeParams: true});
var Coin = require("../models/coins");
var bodyParser = require("body-parser");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//===============
//comments routes
//===============
router.get("/new", middleware.isLoggedIn, (req,res) => {
	Coin.findById(req.params.id, (err, coin) => {		
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

router.post("/", middleware.isLoggedIn, (req, res) => {
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
router.get("/:comment_id/edit",middleware.chkCommentOwner, (req,res) =>{
	Comment.findById(req.params.comment_id, (err, foundComment)=>{
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {coin_id: req.params.id, comment: foundComment});
		}
	})
});

// UPDATE ROUTE
router.put("/:comment_id",middleware.chkCommentOwner, (req,res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err,updatedComment)=>{
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/coins/" + req.params.id);
		}
	});
});

router.delete("/:comment_id",middleware.chkCommentOwner, (req,res)=>{
	Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/coins/" + req.params.id);
		}
	})
})


module.exports = router;