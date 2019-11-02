const ApiAccountRouter = require("express").Router();
const auth = require("../../../middleware/auth");
const crypto = require("crypto");
const strings = require("../../../views/strings.json");
const sprintf = require("sprintf");
const User = require("../../../models/users");
const base32 = require("thirty-two");

ApiAccountRouter.route("/")
///

ApiAccountRouter.route("/password")
///

ApiAccountRouter.route("/2fa")
    .get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
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
    })
    .post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
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
                req.session.secondFactor = "totp";
                res.redirect("/api/account/2fa");
                }
            );
        } else {
            req.session.method = "plain";
            req.user.key = null;
            res.redirect("/api/account/2fa");
        }
    });

module.exports = ApiAccountRouter;