const auth = require("../../../middleware/auth");
const ApiVoteRouter = require("express").Router();
const Ballot = require("../../../models/ballots");
const Vote = require("../../../models/votes");

ApiVoteRouter.route("/")
    .get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
        res.render("vote", {user: req.user});
    })
    .post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
        const vote = req.vote;
        let ballot = null;
        Ballot.findOne({}, function(err, _ballot) {
            ballot = _ballot;
        })
        //checking names match
        if(vote.above.length == 0 && vote.below.length == 0) {
            res.redirect("/aut/hasVoted");
        }
        for(name of vote.above) {
            if(!ballot.above.includes(name)) {
                res.redirect("/auth/hasVoted");
            }
        }

        const candidatenames = [];
        for(party of ballot.below) {
            candidatenames.concat(party.candidates);
        }

        for(candidate of vote.below) {
            if(!candidatenames.includes(candidate)) {
                res.redirect("/auth/hasVoted");
            }
        }

        const v = new Vote(vote);
        v.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({
                    status: 500,
                    error: err
                });
                res.end();
            }
            res.json({
                status: 200,
            });
            res.end();
            console.log(vote);
        });
    });

module.exports = ApiVoteRouter;