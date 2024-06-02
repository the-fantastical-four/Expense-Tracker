const { check } = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { handleFailedLogin, handleSuccessfulLogin } = require('../middlewares/antiBruteForce');


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

			if (emailExists) {
				console.log('Email already in use.');
				req.flash(
					"error_msg",
					"Email already in use"
				);
				res.redirect("/signup")
			} else {

				bcrypt.hash(password, saltRounds, async function(err, hashed) {
					const user = {
						"full_name": fullName,
						"email": email,
						"password": hashed, 
						"phone_number": phoneNumber,
						"profile_picture": profilePic
					}

					await userModel.createUser(user);

					req.flash(
						"success_msg",
						"You are now registered! Please login"
					);
					res.redirect("/login");
				})
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

			encrypted = await userModel.getPass(email); 

			if (encrypted) {
				await bcrypt.compare(password, encrypted, async function (err, result) {
					if (result) {
						const id = await userModel.getAccountId(email);
						req.session.userId = id;

						const role = await userModel.getRole(id);
						req.session.role = role;

						console.log("Log in success")
						res.redirect("/")
					}
					else {
						throw err;
					}
				});
			} else {
				console.log("User does not exist");
				req.flash('error_msg', 'User does not exist');
				res.redirect("/login");
			}
		}
		else {
			console.log(errors); 
		}
	}
	catch(err) {
		handleFailedLogin(req.body.email);
		req.flash("error_msg", "Something happened! Please try again."); 
		console.error("Could not log in: ", err);
		res.redirect("/login"); 
	}
	
};

exports.logoutUser = (req, res) => {
	if (req.session) {
		if (req.session) {
			req.session.destroy(() => {
				res.clearCookie('connect.sid');
				res.redirect('/login');
			});
		}
	}
	else {
		res.redirect('/login'); 
	}
};

exports.viewAccount = function (req, res) {
	
};

// TODO: Change this to actually render all account information 
exports.viewAccounts = async (req, res) => {
	// just a dummy
	const entries = await userModel.getAllAccounts(); 

	res.render(
		"admin-panel", {
			"account-entry": entries
		}
	)
}