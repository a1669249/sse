const auth = require("../../../middleware/auth");
const audit = require("../../../middleware/audit");
const ApiVoteRouter = require("express").Router();
const Ballot = require("../../../models/ballots");
const Vote = require("../../../models/votes");
const User = require("../../../models/users");

ApiVoteRouter.route("/")
  .get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
    return res.render("vote");
  })
  .post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
    const vote = req.body;
    Ballot.findOne({}, function(err, ballot) {
      let valid = true;
      if (vote.above) {
        //checking names match
        if (vote.above.length == 0 && vote.below.length == 0) {
          valid = false;
        }
        for (name of vote.above) {
          if (!ballot.above.includes(name)) {
            valid = false;
          }
        }
      }
      if (vote.below) {
        let candidatenames = [];
        for (party of ballot.below) {
          candidatenames = candidatenames.concat(party.candidates);
        }
        for (candidate of vote.below) {
          if (!candidatenames.includes(candidate)) {
            valid = false;
          }
        }
      }

      if (valid) {
        const v = new Vote(vote);
        v.save(function(err) {
          if (err) {
            console.log("failed to save");
          }
          console.log("saved");
        });
      }
    });

    req.user.role = "hasVoted";
    User.updateOne({_id: req.user._id}, req.user, function(err, response) {
      if (err) {
        console.log(err);
      }
      console.log(response);
    });
    return res.send({redirect: "/"});
  });

ApiVoteRouter.route("/sausage").get(auth.isLoggedIn, auth.ensureTotp, function(
  req,
  res
) {
  return res.render("hasVoted");
});

ApiVoteRouter.route("/countVotes").get(
  auth.isLoggedIn,
  auth.ensureTotp,
  function(req, res) {
    audit.saveEvent({
      user: req.user,
      action: "Requesting Vote Count"
    });
    //run algorithm
    const results = [];
    return res.render("results", {results});
  }
);

module.exports = ApiVoteRouter;
