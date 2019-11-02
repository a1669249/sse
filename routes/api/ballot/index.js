const auth = require("../../../middleware/auth");
const audit = require("../../../middleware/audit");
const ApiBallotRouter = require("express").Router();

ApiBallotRouter.route("/")
    .get(auth.isLoggedIn, auth.auth, function(req, res) {
        Ballot.findOne({}, function(err, ballot) {
            res.render("editBallot", {ballot});
        });
    })
    .post(auth.isLoggedIn, auth.auth, function(req, res) {
        Ballot.findOne({_id: req.ballot._id}, function(err, oldBallot) {
            audit.saveEvent({
                user: req.user,
                action: "Saving Ballot",
                from: oldBallot,
                to: req.ballot
            });
            Ballot.updateOne(
                {_id: req.ballot._id},
                req.ballot,
                function(err, newBallot) {
                    res.redirect("/");
                }
            );
        });
    });

module.exports = ApiBallotRouter;