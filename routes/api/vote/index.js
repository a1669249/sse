const auth = require("../../../middleware/auth");
const audit = require("../../../middleware/audit");
const ApiVoteRouter = require("express").Router();
const Ballot = require("../../../models/ballots");
const Vote = require("../../../models/votes");
const User = require("../../../models/users");
const crypto = require("../../../middleware/crypto");

ApiVoteRouter.route("/")
	.get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
		return res.render("vote");
	})
	.post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
		let vote = req.body;
		Ballot.findOne({}, function(err, ballot) {
			let valid = false;
			if(vote.below) {
				valid = "below";
				let candidatenames = [];
				for(party of ballot.below) {
					candidatenames = candidatenames.concat(party.candidates);
				}
				for(candidate of vote.below) {
					if(!candidatenames.includes(candidate)) {
						valid = false;
					}
				}
			}
			if(vote.above && valid == false) {
				//checking names match
				valid = "above";
				if(vote.above.length == 0 && vote.below.length == 0) {
					valid = false;
				}
				for(name of vote.above) {
					if(!ballot.above.includes(name)) {
						valid = false;
					}
				}
			}


			if(valid) {
				if(valid == "below") {
					for(party of ballot.below) {
						if(party.candidates.includes(vote.below[0])) {
							vote = party.party;
							break;
						}
					}
				} else {
					vote = vote.above[0];
				}
				console.log(vote);
				details = {
					encrypted: crypto.encrypt(JSON.stringify(vote))
				}
				const v = new Vote(details);
				v.save(function(err) {
					if (err) {
						console.log("failed to save");
					}
					console.log("saved");
				});
			}
		});

		req.user.role = "hasVoted";

		User.updateOne(
			{_id: req.user._id},
			req.user,
			function(err, response) {
				if(err) {
					console.log(err);
				}
				console.log(response);
			}
		);
		return res.send({redirect: "/"});
	});

ApiVoteRouter.route("/sausage")
	.get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
		return res.render("hasVoted");
	});

ApiVoteRouter.route("/countVotes")
	.get(auth.isLoggedIn, auth.ensureTotp, auth.auth, function(req, res) {
		console.log("In count votes");
		audit.saveEvent({
			user: req.user,
			action: "Requesting Vote Count"
		});
		//run algorithm
		Vote.find({}, function(err, response) {
			let votes = [];
			for(row of response) {
				votes.push(JSON.parse(crypto.decrypt(row.encrypted)));
			}
			const map = new Map();
			for(vote of votes) {
				if(map.has(vote)) {
					map.set(vote, map.get(vote) + 1);
				} else {
					map.set(vote, 1);
				}
			}
			result = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
			Ballot.findOne({}, function(err, ballot) {
				const partyNames = [];
				for(party of ballot.below) {
					partyNames.push(party.party);
				}
				let iter = result.keys();
				let partyName = iter.next().value;
				while(!partyNames.includes(partyName)) {
					partyName = iter.next().value;
				}
				return res.render("results", {results: partyName});
			});
		});
	}
);

module.exports = ApiVoteRouter;
