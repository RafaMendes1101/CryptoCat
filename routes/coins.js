var express = require("express");
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require("fs"); // file system
var Coin = require("../models/coins");

var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(png)$/i)) {
    	return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
	cloud_name: 'rafamendes', 
	api_key: 372929523623984, 
	api_secret: "7D6EVDvpca4gjb_N1bR_hdCxMGI"
});


//INDEX ROUTE
router.get("/", (req, res)=> {
	//Get all coins from DB
	Coin.find({}, (err, allCoins)=>{ //find all Coins on DB
		if(err){
			console.log(err);
		} else {			
			res.render("coins/coins",{Coin:allCoins}); // feed the coins.ejs with the Coins found in the DB and render the template
		};
	});

});


//CREATE NEW COIN ROUTE
router.post("/", isLoggedIn, upload.single("icon") ,(req, res) => {	
	cloudinary.uploader.upload(req.file.path, (result) => {
		var name = req.body.name;
		var icon = result.secure_url;
		var acronym = req.body.acronym;
		var desc = req.body.description;
		var video = req.body.video;
		var newCoin = {name: name, acronym: acronym, icon: icon, description: desc, video: video, author: {id: req.user._id, username: req.user.username}};
		//console.log(newCoin);
		Coin.create(newCoin, (err, newCoin) => {
			if(err){
				console.log("erro")
				return res.redirect("back");
			}else{
				console.log("Nova moeda adicionada");

			}
		});
		res.redirect("/coins");
	});
});


//NEW - show form to create new coin post
router.get("/newcoin", isLoggedIn, (req,res) => {
	res.render("coins/newcoin.ejs");
}); //show the form to create a new coin

//SHOW -  shows more info about one coin
router.get("/:acronym", (req,res) =>{
	Coin.findOne({acronym: req.params.acronym}).populate("comments").exec(function(err,foundCoin){
		if (err){
			console.log(err)
		} else {
			//console.log(foundCoin);
			res.render("coins/show.ejs",{Coin:foundCoin});
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