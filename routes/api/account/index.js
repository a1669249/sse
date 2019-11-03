const dotenv 			= require('dotenv').config();
const ApiAccountRouter	= require("express").Router();
const auth				= require("../../../middleware/auth");
const crypto			= require("crypto");
const sprintf			= require("sprintf");
const User				= require("../../../models/users");
const base32			= require("thirty-two");
const nodemailer		= require('nodemailer');

ApiAccountRouter.route("/")
	.post(auth.isLoggedIn, auth.auth, function(req, res) {
		User.find({'role': 'voter'}, (err, doc) => {

		var smtpTransport = nodemailer.createTransport({
			service: "Gmail",
			auth: {
			user: process.env.GMAIL_USER,
			pass: process.env.GMAIL_PASS
			}
		});

		var text = 'Follow this link to create your password: http://localhost:3000/api/account/password?id=';

		var mailOptions = {
			from: process.env.GMAIL_USER,
			subject: 'Create your password to vote',
		};

		for (user of doc) {
			mailOptions.to = user.email;
			mailOptions.text = text + user.passwordID;

			smtpTransport.sendMail(mailOptions, (error, info) => {
				console.log(info);
				console.log('Message sent: %s', info.messageId);
			});
		}

		res.redirect("/");
		});
	});

ApiAccountRouter.route("/password")
	.get(auth.isNotLoggedIn, function(req, res) {
		if (req.query.id == null) {
		return res.redirect("/error");
		}

		User.find({'passwordID': req.query.id}, (err, doc) => {
		if (err || doc.length != 1) {
			return res.redirect("/error");
		}

		if (doc[0].active == true) {
			return res.redirect("/error");
		}

		return res.render("password", {id: req.query.id});
		});
	})
	.post(auth.isNotLoggedIn, function(req, res) {
		if (req.query.id == null || req.body.password1 == null || req.body.password1 == null || req.query.password1 != req.query.password2) {
			return res.redirect("/error");
		}

		const query = {'passwordID': req.query.id, 'active': false};

		User.count(query, function(err, count) {
			console.log(count);

			if (count == 1) {
				User.findOneAndUpdate(query, {'password': req.body.password1, 'active': true}, (err, doc) => {
					if (err || Object.keys(doc).length == 0) {
						return res.redirect("/error");
					}

					return res.redirect("/");
				});
			} else {
				return res.redirect("/");
			}
		});
	});

ApiAccountRouter.route("/2fa")
	.get(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
		var url = null;
		if (req.user.key) {
			var qrData = sprintf(
				"otpauth://totp/%s?secret=%s",
				"AusVote[" + req.user.displayName + "]",
				req.user.key
			);
			url =
				"https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
				qrData;
			}
			res.render("totp-setup", {
			user: req.user,
			qrUrl: url
		});
	})
	.post(auth.isLoggedIn, auth.ensureTotp, function(req, res) {
		if (req.body.totp) {
			req.session.method = "totp";
			console.log("TOTP SETUP");
			var secret = base32.encode(crypto.randomBytes(16));
			secret = secret.toString().replace(/=/g, "");
			req.user.key = secret;
			User.findOneAndUpdate(
				{_id: req.user.id},
				{$set: {key: req.user.key}},
				{new: true},
				(err, doc) => {
				if (err) {
					console.log("Something went wrong when updating data.");
				}
				req.session.secondFactor = "totp";
				res.redirect("/api/account/2fa");
				}
			);
		} else {
			req.session.method = "plain";
			req.user.key = null;
			res.redirect("/api/account/2fa");
		}
	});

module.exports = ApiAccountRouter;