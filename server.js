const dotenv =require('dotenv').config();
var express = require("express");
var session = require("express-session");
var mongoose = require("mongoose");
var path = require("path");
var passport = require("passport");

//Set up default mongoose connection
//Format = mongodb+srv://<MongoDBUser>:<UserPassword>@<ClusterName>-cosb2.mongodb.net/test?retryWrites=true&w=majority
console.log(process.env.DATABASE_URL);
var mongoDB = process.env.DATABASE_URL;
mongoose.connect(
  mongoDB,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create a new Express application.

var app = express();

app.use(express.static('public'));

// Configure view engine to render EJS templates.
app.set("views", [path.join(__dirname, "views"),
path.join(__dirname, "views/admin"),
path.join(__dirname, "views/audit"),
path.join(__dirname, "views/ballot"),
path.join(__dirname, "views/delegate"),
path.join(__dirname, "views/vote"),
path.join(__dirname, "views/auth")]);
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("body-parser").urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
require("./middleware/passport").set(passport);

require("./routes")(app);

app.listen(3000);
