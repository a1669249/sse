const auth = require("../../../middleware/auth");
const audit = require("../../../middleware/audit");
const ApiAuditRouter = require("express").Router();

ApiAuditRouter.route("/")
    // retrieves every action performed since events began being recorded, and exports them
    // granted the requester has the relevant permissions
    .get(auth.isLoggedIn, auth.auth, function(req, res) {
        audit.saveEvent({user: req.user, action: "Auditing"});
        Event.find({}, function(err, events) {
            return res.render("audit", {events});
        });
    })

module.exports = ApiAuditRouter;