var express = require("express");
var passport = require("passport");
var session = require("express-session");
var LocalStrategy = require("passport-local").Strategy;
var TotpStrategy = require("passport-totp").Strategy;
var base32 = require("thirty-two");
var sprintf = require("sprintf");
var crypto = require("crypto");
var mongoose = require("mongoose");

var User = require("./models/users");
var Role = require("./models/roles");
var Event = require("./models/events");
var Ballot = require("./models/ballots");
var strings = require("./views/strings.json");

// var saveEvent = require("./auditing/saveEvent");

//Set up default mongoose connection
//Format = mongodb+srv://<MongoDBUser>:<UserPassword>@<ClusterName>-cosb2.mongodb.net/test?retryWrites=true&w=majority
var mongoDB =
  "mongodb+srv://sseproject:sseproject@sseproject-cosb2.mongodb.net/myvote?retryWrites=true&w=majority";
mongoose.connect(
  mongoDB,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
  new LocalStrategy(function(username, password, cb) {
    User.findOne({username: username}, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  })
);

passport.use(
  new TotpStrategy(function(user, done) {
    var key = user.key;
    if (!key) {
      return done(new Error("No Key"));
    } else {
      return done(null, base32.decode(key), 30);
    }
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

// Note id is the default _id field in mongoDB
passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

// creates a new event based on the user performing it and the action
// if the user is a voter, then their name is not recorded
// it is recorded if they are a delegate or admin, for accountability purposes
// this function can be placed within any action to record an event
function saveEvent({user, action}) {
  return new Promise(function(resolve, reject) {
    let event = new Event({
      timestamp: new Date(),
      action,
      user:
        user.role === "voter" ? user.role : `${user.username} (${user.role})`
    });
    event.save(function(err) {
      if (err) {
        reject(err);
        console.log(err);
        return;
      }
      resolve(event);
      console.log(event);
    });
  });
}

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("body-parser").urlencoded({extended: true}));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// checks for the relevant authorisation for a users actions
// if the desired action is not present in the permissions of their role, they are denied
// this function can be placed before any action to determine whether it should be completed
function auth(req, res, next) {
  Role.findOne({name: req.user.role}, function(err, role) {
    if (role.permissions.includes(req.originalUrl.split("/")[1])) {
      next();
    } else res.sendStatus(401);
  });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/logout");
  }
}

function ensureTotp(req, res, next) {
  if (
    (req.session.secondFactor && req.session.method == "totp") ||
    (!req.user.key && req.session.method == "plain")
  ) {
    next();
  } else {
    res.redirect("/logout");
  }
}

// Define routes.
app.get("/", isLoggedIn, ensureTotp, function(req, res) {

  if (req.user.role == "voter"){
    res.render("vote", {user: req.user});
    //Temp User Pass
  }
  if (req.user.role == "hasVoted"){
    res.render("hasVoted");
  }
  if (req.user.role == "delegate"){
    Ballot.findOne({}, function(err, ballot) {
      res.render("delegate",{ballot});
    });
  }
  if (req.user.role == null){
    console.log("Logic error, account has no role.");
    res.redirect("/login");
  }
});

// retrieves every action performed since events began being recorded, and exports them
// granted the requester has the relevant permissions
app.post("/audit", isLoggedIn, auth, function(req, res) {
  saveEvent({user: req.user, action: "Auditing"});
  Event.find({}, function(err, events) {
    return res.render("audit", {events});
  });
});

app.post("/eventTest", function(req, res) {
  let promise = saveEvent({
    user: {username: "TestName", role: "delegate"},
    action: "vote"
  });
  Promise.resolve(promise).then(() => {
    res.send();
  });
});

app.get("/vote", isLoggedIn, ensureTotp, function(req, res) {
  res.render("vote", {user: req.user});
});

app.post("/editBallot", isLoggedIn, auth, function(req, res) {
  Ballot.findOne({}, function(err, ballot) {
    res.render("editBallot", {ballot});
  });
});

app.post("/saveBallot", isLoggedIn, auth, function(req, res) {
  Ballot.findOne({}, function(err, ballot) {
    res.render("editBallot", {ballot});
  });
});

app.get("/totp-input", isLoggedIn, function(req, res) {
  if (!req.user.key) {
    console.log("Logic error, totp-input requested with no key set");
    res.redirect("/login");
  }

  res.render("totp-input", {
    strings: strings
  });
});

app.post(
  "/totp-input",
  isLoggedIn,
  passport.authenticate("totp", {failureRedirect: "/login"}),
  function(req, res) {
    req.session.secondFactor = "totp";
    res.redirect("/");
  }
);

app.get("/totp-setup", isLoggedIn, ensureTotp, function(req, res) {
  var url = null;
  if (req.user.key) {
    var qrData = sprintf(
      "otpauth://totp/%s?secret=%s",
      "AusVote[" + req.user.displayName + "]",
      req.user.key
    );
    url =
      "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
      qrData;
  }
  res.render("totp-setup", {
    strings: strings,
    user: req.user,
    qrUrl: url
  });
});

app.post("/totp-setup", isLoggedIn, ensureTotp, function(req, res) {
  if (req.body.totp) {
    req.session.method = "totp";
    console.log("TOTP SETUP");
    var secret = base32.encode(crypto.randomBytes(16));
    secret = secret.toString().replace(/=/g, "");
    req.user.key = secret;
    User.findOneAndUpdate(
      {_id: req.user.id},
      {$set: {key: req.user.key}},
      {new: true},
      (err, doc) => {
        if (err) {
          console.log("Something went wrong when updating data.");
        }
        res.session.secondFactor = "totp";
        res.redirect("/totp-setup");
      }
    );
  } else {
    req.session.method = "plain";
    req.user.key = null;
    res.redirect("/totp-setup");
  }
});

app.get("/login", function(req, res) {
  req.logout();
  res.render("login", {
    strings: strings
  });
});

app.post(
  "/login",
  passport.authenticate("local", {failureRedirect: "/login"}),
  function(req, res) {
    if (req.user.key) {
      req.session.method = "totp";
      res.redirect("/totp-input");
    } else {
      req.session.method = "plain";
      //CHANGE TO TOTP-SETUP BEFORE RELEASE
      res.redirect("/");
    }
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  req.session.secondFactor = undefined;
  res.redirect("/login");
});
app.listen(3000);
