var express=require("express"); // manages the server
var app = express(); // assign the variable app to load and manage the server routes
var bodyParser = require("body-parser");
var path = require('path');
var fs = require("fs"); // file system
var mongoose = require("mongoose");
var multer = require('multer');
var Coin = require("./models/coins");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Comment = require("./models/comment");

//seedDB(); 

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "site foda",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ============================================== \\
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

// feed currentUser into all templates
app.use(function(req,res,next){ 
	res.locals.currentUser = req.user;
	next();
});


app.get("/", (req, res) => {
	Coin.find({}, (err, allCoins)=>{ //find all Coins on DB
		if(err){
			console.log(err);
		} else {
			res.render("home",{Coin:allCoins , currentUser: req.user});
		};
	});
});

//INDEX ROUTE
app.get("/coins", (req, res)=> {
	//Get all coins from DB
	Coin.find({}, (err, allCoins)=>{ //find all Coins on DB
		if(err){
			console.log(err);
		} else {			
			res.render("coins/coins",{Coin:allCoins, currentUser: req.user}); // feed the coins.ejs with the Coins found in the DB and render the template
		};
	});

});


//CREATE NEW COIN ROUTE
app.post("/coins", isLoggedIn, upload.single("icon") ,(req, res) => {	
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
		res.redirect("/coins");
	});
});


// Render new user page
app.get("/newuser", (req,res) =>{
	res.render("users/newuser");
});

//create new user route
app.post("/newuser", (req,res) => {
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

//NEW - show form to create new coin post
app.get("/coins/newcoin", isLoggedIn, (req,res) => {
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
});
//===============
//comments routes
//===============
app.get("/coins/:acronym/comments/new", isLoggedIn, (req,res) => {
	Coin.findOne({acronym: req.params.acronym}, (err, coin) => {
		//console.log(coin)
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {coin: coin});
		}
	});		
});

app.post("/coins/:acronym/comments", isLoggedIn, (req, res) => {
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

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/coins",
	failureRedirect: "login"
}),(req,res) => {

});
//logou route
app.get("/logout", (req,res) => {
	req.logout();
	res.redirect("/coins");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000,  () => {
	console.log("CryptoCat Server Started");
});