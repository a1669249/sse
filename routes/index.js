var auth = require("../middleware/auth");
var Ballot = require("../models/ballots");

module.exports = function(app) {
  app.use("/api", require("./api"));
  app.use("/auth", require("./auth"));
  app.get("/", auth.isLoggedIn, auth.ensureTotp, function(req, res) {
    switch (req.user.role) {
      case "voter":
        res.redirect("/api/vote");
        break;
      case "hasVoted":
        res.redirect("/api/vote/sausage");
        break;
      case "delegate":
        res.render("delegate");
        break;
      default:
        console.log("Logic error, account has no role.");
        res.redirect("/auth/login");
    }
  });
}
