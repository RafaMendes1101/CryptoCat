var express = require("express");
var router = express.Router();
var Coin = require("../models/coins");
var passport = require("passport");
var User = require("../models/user");
router.get("/", (req, res) => {
	Coin.find({}, (err, allCoins)=>{ //find all Coins on DB
		if(err){
			console.log(err);
		} else {
			res.render("home",{Coin:allCoins});
		};
	});
});




// Render new user page
router.get("/newuser", (req,res) =>{
	res.render("users/newuser");
});

//create new user route
router.post("/newuser", (req,res) => {
	var newUser = new User({username: req.body.username, email: req.body.email});
	User.register(newUser, req.body.password, (err, newUser) =>{
		if(err){
			console.log(err);
			return res.render("users/newuser");
		}
		console.log("Novo usuario criado");
		passport.authenticate("local")(req, res, () => {
			res.redirect("/coins");		
		})		
	});
});

// login routes
router.get("/login", (req, res) => {
	res.render("login");
});

router.post("/login", passport.authenticate("local", {
	successRedirect: "/coins",
	failureRedirect: "login"
}),(req,res) => {

});
//logout route
router.get("/logout", (req,res) => {
	req.logout();
	res.redirect("/coins");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;