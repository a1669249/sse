var auth = require("../middleware/auth");
var Ballot = require("../models/ballots");

module.exports = function(app) {
  app.use("/api", require("./api"));
  app.use("/auth", require("./auth"));
  app.get("/", auth.isLoggedIn, auth.ensureTotp, function(req, res) {
    switch (req.user.role) {
      case "voter":
        res.render("vote", {user: req.user});
        break;
      case "hasVoted":
        res.render("hasVoted");
        break;
      case "delegate":
        Ballot.findOne({}, function(err, ballot) {
          res.render("delegate",{ballot});
        });
        break;
      default:
        console.log("Logic error, account has no role.");
        res.redirect("/auth/login");
    }
  });
}
