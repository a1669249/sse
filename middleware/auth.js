module.exports = {
    isLoggedIn: function(req, res, next){
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/auth/logout");
        }
    },
    ensureTotp: function(req, res, next){
        if (
            (req.session.secondFactor && req.session.method == "totp") ||
            (!req.user.key && req.session.method == "plain")
        ) {
            next();
        } else {
            res.redirect("/auth/logout");
        }
    },
    // checks for the relevant authorisation for a users actions
    // if the desired action is not present in the permissions of their role, they are denied
    // this function can be placed before any action to determine whether it should be completed
    auth: function(req, res, next) {
        Role.findOne({name: req.user.role}, function(err, role) {
            if (role.permissions.includes(req.originalUrl.split("/")[1])) {
                next();
            } else res.sendStatus(401);
        });
    }
}