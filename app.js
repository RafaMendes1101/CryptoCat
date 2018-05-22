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

//seedDB(); 

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
	api_secret: ""
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
			// console.log(allCoins);
			res.render("coins",{Coin:allCoins}); // feed the coins.ejs with the Coins found in the DB and render the template
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
		var newCoin = {name: name, acronym: acronym, icon: icon, description: desc};
		console.log(newCoin);
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


// Render new user page
app.get("/newuser", (req,res) =>{
	res.render("newuser");
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
	res.render("newcoin.ejs");
		}); //show the form to create a new coin

//SHOW -  shows more info about one coin
app.get("/coins/:acronym", (req,res) =>{
	Coin.findOne({acronym: req.params.acronym}, (err,foundCoin) =>{
		if (err){
			console.log(err)
		} else {
			res.render("show.ejs",{Coin:foundCoin});
		}
	});
//req.params.acronym;

});
//show Coin

app.listen(3000,  function(){
	console.log("CryptoCat Server Started")
});