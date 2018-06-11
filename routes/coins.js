var express = require("express");
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require("fs"); // file system
var Coin = require("../models/coins");
var middleware = require("../middleware");
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
router.post("/",middleware.isLoggedIn, upload.single("icon") ,(req, res) => {	
	cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
		if(err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		var newCoin = {
			name: req.body.name, 
			acronym: req.body.acronym, 
			icon: result.secure_url,iconId: result.public_id, 
			description: req.body.description,
			video: req.body.video, 
			author: {
				id: req.user._id, 
				username: req.user.username
			}
		};
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
router.get("/newcoin", middleware.isLoggedIn, (req,res) => {
	res.render("coins/newcoin.ejs");
}); //show the form to create a new coin

//SHOW -  shows more info about one coin
router.get("/:id", (req,res) =>{
	//console.log(req.params.id);
	Coin.findById(req.params.id).populate("comments").exec(function(err,foundCoin){
		if (err){
			console.log(err)
		} else {
			//console.log(foundCoin);
			res.render("coins/show.ejs",{Coin:foundCoin});
		}
	});
});

//EDIT ROUTE
router.get("/:id/edit", middleware.chkPostOwner, (req, res) => {	
	Coin.findById(req.params.id, (err, foundCoin) => {
		if(err){
			res.redirect("/coins");
		}else {
			res.render("coins/edit", {Coin:foundCoin});
		}
	});	
});

//UPDATE ROUTE upload.single("icon"),
router.put("/:id",middleware.chkPostOwner, upload.single("icon"),(req,res) => {	
	Coin.findById(req.params.id, (err, foundCoin) => {
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		if (req.file){
			cloudinary.v2.uploader.destroy(foundCoin.iconId, (err)=>{
				if(err){
					console.log("erro1");
					return res.redirect("back");
				}			
				cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
					if(err){
						console.log("erro2");
						return res.redirect("back");
					}
					foundCoin.iconId = result.public_id;
					foundCoin.icon = result.secure_url;
					foundCoin.save();
				});
			});
		}

		foundCoin.name = req.body.name;
		foundCoin.description = req.body.description;
		foundCoin.video = req.body.video;
		foundCoin.acronym = req.body.acronym;
		foundCoin.save();		
		res.redirect("/coins/" + req.params.id);
	});
});

// DESTROY ROUTE
router.delete("/:id", middleware.chkPostOwner, (req, res) => {
	Coin.findByIdAndRemove(req.params.id, req.body.id, (err, deleteCoin) => {
		if(err){
			res.redirect("/coins/" + req.params.id);
		} else {
			cloudinary.v2.uploader.destroy(deleteCoin.iconId,(err, result)=>{
				if(err){
					console.log(err);
				}else{
					res.redirect("/coins");
				}			
			});
		}
	})
});


module.exports = router;
