var express=require("express"); // manages the server
var app = express(); // assign the variable app to load and manage the server routes
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Coin = require("./models/coins");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Comment = require("./models/comment");
var path = require('path');
var fs = require("fs"); // file system
var methodOverride = require("method-override");
var commentRoutes = require("./routes/comments"),
	coinsRoutes = require("./routes/coins"),
	indexRoutes = require("./routes/index")

seedDB(); 

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "site foda",
	resave: false,
	saveUninitialized: false
}));

app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ============================================== \\


mongoose.connect("mongodb://localhost/CryptoCat");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
// feed currentUser into all templates
app.use(function(req,res,next){ 
	res.locals.currentUser = req.user;
	next();
});



app.use(indexRoutes);
app.use("/coins",coinsRoutes);
app.use(commentRoutes);


app.listen(3000,  () => {
	console.log("CryptoCat Server Started");
});