const AuthLoginRouter = require("express").Router();
const passport = require("../../../middleware/passport").passport;
const auth = require("../../../middleware/auth");


AuthLoginRouter.route("/")
    .get(function(req, res) {
        req.logout();
        res.render("login", {
        });
    })
    .post(passport.authenticate("local", {failureRedirect: "/auth/login"}),
        function(req, res) {
            if (req.user.key) {
                req.session.method = "totp";
                res.redirect("/auth/login/2fa");
            } else {
                req.session.method = "plain";
                // res.redirect("/");
                res.redirect("/api/account/2fa");
            }
        }
    );

AuthLoginRouter.route("/2fa")
    .get(auth.isLoggedIn, function(req, res) {
        if (!req.user.key) {
            console.log("Logic error, totp-input requested with no key set");
            res.redirect("/auth/login");
        }

        res.render("totp-input", {
        });
    })
    .post(
        auth.isLoggedIn,
        passport.authenticate("totp", {failureRedirect: "/auth/login"}),
        function(req, res) {
            req.session.secondFactor = "totp";
            res.redirect("/");
        }
    );

module.exports = AuthLoginRouter;