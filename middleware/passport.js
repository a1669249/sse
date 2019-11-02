const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const TotpStrategy = require("passport-totp").Strategy;
const base32 = require("thirty-two");
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


module.exports = passport;