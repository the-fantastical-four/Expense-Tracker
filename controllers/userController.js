const { check } = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

			emailExists = await userModel.checkEmailExists(email); 
			phoneExists = await userModel.checkPhoneExists(phoneNumber); 

			if (emailExists) {
				console.log('Email already in use.');
				req.flash(
					"error_msg",
					"Email already in use"
				);
				res.redirect("/signup")
			} else if (phoneExists) {
				console.log('Phone number already in use.');
				req.flash(
					"error_msg",
					"Phone number already in use"
				);
				res.redirect("/signup");
			} else {
				id = await userModel.signUp(email, password); // no need to hash password, supabase does it 

				user = {
					"user_id": id, 
					"full_name": fullName,
					"email": email,
					"phone_number": phoneNumber,
					"profile_pic": profilePic
				}

				await userModel.createUser(user);

				req.flash(
					"success_msg",
					"You are now registered! Please login"
				);
				res.redirect("/login");
			}
		}
		catch (err) {
			console.error(err); 
			req.flash("error_msg", "Could not create user. Please try again.");
			res.redirect("/signup");

			// if fail maybe delete from auth table if new user was inserted 
		}
	} else {
		const messages = errors.array().map((item) => item.msg);

		req.flash("error_msg", messages.join(" "));
		res.redirect("/signup");
	}
};

exports.loginUser = async (req, res) => {
	const errors = validationResult(req);

	try {

		if (errors.isEmpty()) {
			const {
				email,
				password
			} = req.body;

			const data = await userModel.signIn(email, password);
			console.log("Log in success")
			req.session.userId = data.user.id; 
			// ADD CHECK HERE FOR ROLE TO SET IF WITH ADMIN PERMISSIONS 
			res.redirect("/")
		}
		else {
			console.log(errors); 
		}
	}
	catch(err) {
		req.flash("error_msg", "Something happened! Please try again."); 
		console.log("Could not log in: ", err);
		res.redirect("/login"); 
	}
};

exports.logoutUser = (req, res) => {
	if (req.session) {
		userModel.signOut(); 
		console.log("signed out using superbase function")

		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});

		res.redirect("/login");
	}
};

exports.viewAccount = function (req, res) {
	
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