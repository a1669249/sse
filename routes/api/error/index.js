const auth = require("../../../middleware/auth");
const ApiAuditRouter = require("express").Router();
const Event = require("../../../models/events");

ApiAuditRouter.route("/")
	.get(function(req, res) {
		return res.render("error");
	});

module.exports = ApiAuditRouter;
