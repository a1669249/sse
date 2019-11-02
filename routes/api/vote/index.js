const auth = require("../../../middleware/auth");
const ApiVoteRouter = require("express").Router();

ApiVoteRouter.route("/")
    .get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
        res.render("vote", {user: req.user});
    })
    .post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
        res.render("vote", {user: req.user});
    });

module.exports = ApiVoteRouter;