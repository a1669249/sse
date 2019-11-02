const AuthRouter = require("express").Router();

AuthRouter.use("/login", require("./login"));
AuthRouter.use("/logout", require("./logout"));

module.exports = AuthRouter;