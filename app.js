var express=require("express"); // manages the server
var app = express(); // assign the variable app to load and manage the server routes
var bodyParser = require("body-parser");
var path = require('path');
var fs = require("fs"); // file system
var mongoose = require("mongoose");
var multer = require('multer');
var Coin = require("./models/coins");
var Users = require("./models/user");
var seedDB = require("./seeds");
var Comment = require("./models/comment");

seedDB(); 

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


mongoose.connect("mongodb://localhost/CryptoCat");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");




app.get("/", (req, res) => {
	res.render("home");
});

//INDEX ROUTE
app.get("/coins", (req, res)=> {
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
app.post("/coins", upload.single("icon") ,(req, res) => {	
	cloudinary.uploader.upload(req.file.path, (result) => {
		var name = req.body.name;
		var icon = result.secure_url;
		var acronym = req.body.acronym;
		var desc = req.body.description;
		var video = req.body.video;
		var newCoin = {name: name, acronym: acronym, icon: icon, description: desc, video: video};
		//console.log(newCoin);
		Coin.create(newCoin, (err, newCoin) => {
			if(err){
				console.log("erro")
				return res.redirect("back");
			}else{
				console.log("Nova moeda adicionada");

			}
		});
		res.redirect("/coins/:acronym");
	});
});


// Render new user page
app.get("/newuser", (req,res) =>{
	res.render("users/newuser");
});

//create new user route
app.post("/newuser", (req,res) => {
	var username = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var newUser = {name: name, email: email, password: password};
	Users.create(newUser, (err, newUser) =>{
		if(err){
			console.log(err);
		}else{
			console.log("Novo usuario criado");
			res.redirect("/");
		}
	});
});

//NEW - show form to create new coin post
app.get("/coins/newcoin", (req,res) => {
	res.render("coins/newcoin.ejs");
		}); //show the form to create a new coin

//SHOW -  shows more info about one coin
app.get("/coins/:acronym", (req,res) =>{
	Coin.findOne({acronym: req.params.acronym}).populate("comments").exec(function(err,foundCoin){
		if (err){
			console.log(err)
		} else {
			//console.log(foundCoin);
			res.render("coins/show.ejs",{Coin:foundCoin});
		}
	});
//req.params.acronym;

});
//===============
//comments routes
//===============
app.get("/coins/:acronym/comments/new", (req,res) => {
	Coin.findOne({acronym: req.params.acronym}, (err, coin) => {
		//console.log(coin)
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

app.post("/coins/:acronym/comments", (req, res) => {
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



app.listen(3000,  () => {
	console.log("CryptoCat Server Started");
});