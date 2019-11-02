const auth = require("../../../middleware/auth");
const ApiVoteRouter = require("express").Router();
const Ballot = require("../../../models/ballots");
const Vote = require("../../../models/votes");

ApiVoteRouter.route("/")
    .post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
        const vote = req.body;

        Ballot.findOne({}, function(err, ballot) {

            //checking names match
            if(vote.above.length == 0 && vote.below.length == 0) {
                res.render("hasVoted");
            }
            for(name of vote.above) {
                if(!ballot.above.includes(name)) {
                    res.render("hasVoted");
                }
            }

            const candidatenames = [];
            for(party of ballot.below) {
                candidatenames.concat(party.candidates);
            }

            for(candidate of vote.below) {
                if(!candidatenames.includes(candidate)) {
                    res.render("hasVoted");
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
        })
    });

module.exports = ApiVoteRouter;