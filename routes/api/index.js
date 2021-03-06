const ApiRouter = require("express").Router();

ApiRouter.use("/vote", require("./vote"));
ApiRouter.use("/ballot", require("./ballot"));
ApiRouter.use("/audit", require("./audit"));
ApiRouter.use("/account", require("./account"));
ApiRouter.use("/error", require("./error"));

module.exports = ApiRouter;