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
var strings = require("./views/strings.json");

var PERMISSIONS = require("./rbac/permissions");
var saveEvent = require("./auditing/saveEvent");

//Set up default mongoose connection
//Format = mongodb+srv://<MongoDBUser>:<UserPassword>@<ClusterName>-cosb2.mongodb.net/<DatabaseName>?retryWrites=true&w=majority
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
    Users.find({username: username}, function(err, user) {
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

function authorise(req, res, action) {
  Role.find({name: req.user.role}, function(err, role) {
    console.log("ROLE", role);
    return role.permissions.includes(action);
  });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

function ensureTotp(req, res, next) {
  if (
    (req.user.key && req.session.method == "totp") ||
    (!req.user.key && req.session.method == "plain")
  ) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Define routes.
app.get("/", isLoggedIn, ensureTotp, function(req, res) {
  res.redirect("/profile");
});

app.post("/eventTest", function(req, res) {
  saveEvent({user: {username: "TestName", role: ["voter"]}, action: "vote"});
});

app.get("/vote", isLoggedIn, ensureTotp, function(req, res) {
  if (authorise(req, res, "vote")) {
    res.render("vote", {user: req.user});
  } else {
    res.redirect("/profile");
  }
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
  passport.authenticate("totp", {
    failureRedirect: "/login",
    successRedirect: "/profile"
  })
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
  } else {
    req.session.method = "plain";
    req.user.key = null;
  }
  res.redirect("/totp-setup");
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
      res.redirect("/profile");
    }
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/profile", isLoggedIn, ensureTotp, function(req, res) {
  res.render("profile", {user: req.user});
});

app.listen(3000);
