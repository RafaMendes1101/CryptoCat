var express=require("express"); // manages the server
var app = express(); // assign the variable app to load and manage the server routes
var bodyParser = require("body-parser");
var path = require('path');
var fs = require("fs"); // file system
var mongoose = require("mongoose");
var multer = require('multer');
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

var coinSchema = new mongoose.Schema({
	name: String,
	icon: String
});

var Coin = mongoose.model("Coin", coinSchema);

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



//CREATE ROUTE
app.post("/coins", upload.single("icon") ,(req, res)=> {	
	cloudinary.uploader.upload(req.file.path, function(result){
		var name = req.body.name;
		var icon = result.secure_url;
		var newCoin = {name: name, icon: icon};
		console.log(newCoin);
		Coin.create(newCoin, function(err, newCoin){
			if(err){
				console.log("erro")
				return res.redirect("back");
			}else{
				console.log(newCoin);
			}
		});
		res.redirect("/coins");
	});
});

//NEW - show form to create new coin post
app.get("/coins/newcoin", (req,res) => {
	res.render("newcoin.ejs");
		}); //show the form to create a new coin


//show Coin

app.listen(3000,  function(){
	console.log("CryptoCat Server Started")
});