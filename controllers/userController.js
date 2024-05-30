const {
	check
} = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
	const errors = validationResult(req);

	console.log(errors);

	if (errors.isEmpty()) {
		const {
			fullName,
			email,
			phoneNumber,
			profilePic, 
			password
		} = req.body;

		try {
			user = {
				"full_name" : fullName, 
				"email" : email,
				"phone_number" : phoneNumber, 
				"profile_pic" : profilePic
			}

			await userModel.createUser(user);

			req.flash("success_msg", "You are now registered! Please login.");
			res.redirect("/login");
		}
		catch (err) {
			console.error(err); 
			req.flash("error_msg", "Could not create user. Please try again.");
			res.redirect("/signup");
		}
		// userModel.getOne({
		// 		email: email,
		// 	},
		// 	(err, result) => {
		// 		if (result) {
		// 			console.log(result);
		// 			//if email already exists: throw error
		// 			req.flash("error_msg", "User already exists. Please login");
		// 			res.redirect("/login");
		// 		} else {
		// 			//create user
		// 			const saltRounds = 10;
		// 			bcrypt.hash(password, saltRounds, (err, hashed) => {
		// 				const newUser = {
		// 					username,
		// 					email,
		// 					password: hashed,
		// 				};

		// 				userModel.create(newUser, (err, user) => {
		// 					if (err) {
		// 						console.log(err);
		// 						req.flash(
		// 							"error_msg",
		// 							"Could not create user. Please try again"
		// 						);
		// 						res.redirect("/signup");
		// 					} else {
		// 						req.flash(
		// 							"success_msg",
		// 							"You are now registered! Please login"
		// 						);
		// 						res.redirect("/login");
		// 					}
		// 				});
		// 			});
		// 		}
		// 	}
		// );
	} else {
		const messages = errors.array().map((item) => item.msg);

		req.flash("error_msg", messages.join(" "));
		res.redirect("/signup");
	}
};

exports.loginUser = (req, res) => {
	const errors = validationResult(req);

	if (errors.isEmpty()) {
		const {
			username,
			password
		} = req.body;

		// Next items go here... Same as before, this will be replaced.
		userModel.getOne({
				username: username,
			},
			(err, User) => {
				if (err) {
					// Database error occurred...
					req.flash("error_msg", "Something happened! Please try again.");
					res.redirect("/login");
				} else {
					// Successful query
					if (User) {
						// User found!

						bcrypt.compare(password, User.password, (err, result) => {
							//passwords match (result == true)
							if (result) {
								//update session object once matched
								req.session.user = User._id;
								req.session.username = User.username;
								req.session.email = User.email;

								console.log(req.session);

								res.redirect("/");
							} else {
								//passwords don't match
								req.flash("error_msg", "Incorrect password. Please try again");
								res.redirect("/login");
							}
						});
					} else {
						// No user found
						req.flash(
							"error_msg",
							"No registered user with that username. Please register."
						);
						res.redirect("/signup");
					}
				}
			}
		);
	} else {
		const messages = errors.array().map((item) => item.msg);

		req.flash("error_msg", messages.join(" "));
		res.redirect("/login");
	}
};

exports.logoutUser = (req, res) => {
	if (req.session) {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
};

exports.viewAccount = function (req, res) {
	userModel.getById(req.session.user, function (err, data) {
		res.render("view-account", {
			layout: "no-new-entry",
			email: data.email,
			username: data.username,
		});
	});
};

// TODO: Change this to actually render all account information 
exports.viewAccounts = function (req, res) {
	// just a dummy
	const entries = [{
			name: "Dora Explora",
			email: "dora@gmail.com",
			phone: "09173334444"
		},
		{
			name: "Bob Builder",
			email: "bob@builder.com",
			phone: "09171234567"
		},
		{
			name: "Mickey Mouse",
			email: "mickey@disney.com",
			phone: "09179876543"
		}
	];
	res.render(
		"admin-panel", {
			"account-entry": entries
		}
	)
}