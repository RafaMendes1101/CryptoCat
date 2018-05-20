const express=require("express"); // manages the server
const app = express(); // assign the variable app to load and manage the server routes
const bodyParser = require("body-parser");
const formidable = require("formidable"); //save uploaded file module
const path = require('path');
const fs = require("fs"); // file system
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/CryptoCat");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var coinSchema = new mongoose.Schema({
	name: String,
	icon: String,
	description: String
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
app.post("/coins", (req, res)=> {	
	var name = req.body.name;
	var icon = "/logos/" + req.body.icon;
	console.log(name, icon, bodyParser);
	var newCoin = {name: name, icon: icon};
	//coin.push(newCoin);
	Coin.create(newCoin, (err,coin) =>{
		if(err){
			console.log(err)
		}else{
			console.log(coin);
		};
	});
	var iconUpload = new formidable.IncomingForm();
	
	iconUpload.multiples = false;
	iconUpload.uploadDir = path.join(__dirname, '/public/logos');
	// every time a file has been uploaded successfully,
	// rename it to it's orignal name
	iconUpload.on('file', function(field, file) {
		fs.rename(file.path, path.join(iconUpload.uploadDir, file.name));
	});

	iconUpload.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});
	res.redirect("/coins");

	iconUpload.parse(req);
	console.log(coin);	
});

//NEW - show form to create new coin post
app.get("/coins/newcoin", (req,res) => {
	res.render("newcoin.ejs");
	}); //show the form to create a new coin


//show Coin
app.get("/coins/:id", (req, res) => {

});
app.listen(3000,  function(){
	console.log("CryptoCat Server Started")
});