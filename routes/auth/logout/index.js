const AuthLogoutRouter = require("express").Router();

AuthLogoutRouter.route("/")
    .get(function(req, res) {
        req.logout();
        req.session.secondFactor = undefined;
        res.redirect("/auth/login");
    });

module.exports = AuthLogoutRouter;