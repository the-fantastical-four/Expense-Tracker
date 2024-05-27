// import database stuff
const postModel = require("../database/models/Post");
const userModel = require("../database/models/User")
const path = require('path');
const { ObjectId } = require('mongodb');

exports.getAllEntries = function (req, res) {
	postModel.getAllEntries({ user: req.session.user }, function (entries) {
		userModel.getById(req.session.user, function(err, result) {
			res.render("index", { 
				entry: entries,
				budgetGoal: result.budgetGoal,
				savingsGoal: result.savingsGoal
			});
		});
	});
}

exports.login = function (req, res) {
	res.render("login", { layout: "login-layout" });
}

exports.signup = function (req, res) {
	res.render("signup", { layout: "login-layout" });
}