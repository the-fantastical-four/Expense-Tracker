const { check } = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { handleFailedLogin, handleSuccessfulLogin } = require('../middlewares/antiBruteForce');
const { checkIfImage } = require('../middlewares/multerConfig')

const fs = require('fs'); 

function deleteFile(filePath) {
	fs.unlink(filePath, (err) => {
		if (err) {
			console.error('Failed to delete invalid file:', err);
		}
	});
}


exports.registerUser = async (req, res) => {
	const errors = validationResult(req);

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

				return res.redirect("/error")
			} else {

				// check uploaded image first 
				let filePath = ''

				if (req.file) {
					filePath = req.file.path;
					
					if(!checkIfImage(filePath)) {
						// TODO: add delete file here 
						deleteFile(filePath); 

						req.flash(
							"error_msg", 
							"Please upload a supported image"
						);
						return res.redirect('/signup');
					}
				} else { 
					console.error('Error: No file uploaded');
					req.flash(
						"error_msg",
						"Please upload an image"
					);
					return res.redirect('/signup');
				}

				bcrypt.hash(password, saltRounds, async function(err, hashed) {
					if (err) {
						console.error(err);
						req.flash("error_msg", "Could not create user. Please try again. \n" + err);
						return res.redirect("/error"); // Return here to prevent further execution
					}

					updatedPath = filePath.replace(/^public\\/, "");

					const user = {
						"full_name": fullName,
						"email": email,
						"password": hashed, 
						"phone_number": phoneNumber,
						"profile_picture": updatedPath
					}

					await userModel.createUser(user);

					req.flash(
						"success_msg",
						"You are now registered! Please login"
					);
					return res.redirect("/login");
				})
			}
		}
		catch (err) {
			console.error(err); 
			req.flash("error_msg", "Could not create user. Please try again. \n" + err);
			return res.redirect("/error");

			// if fail maybe delete from auth table if new user was inserted 
		}
	} else {
		const messages = errors.array().map((item) => item.msg);
		
		deleteFile(req.file.path)

		req.flash("error_msg", messages.join(" "));
		return res.redirect("/error");
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

			const encrypted = await userModel.getPass(email); 

			if (encrypted) {
				bcrypt.compare(password, encrypted, async (err, result) => {
					if (result) {
						const id = await userModel.getAccountId(email);
						req.session.userId = id;

						const role = await userModel.getRole(id);
						req.session.role = role;

						handleSuccessfulLogin(email);

						console.log("Log in success")
						res.redirect("/")
					}
					else {
						handleFailedLogin(email, req, res);
						req.flash("error_msg", "Login credentials don't match");
						return res.redirect("/login");
					}
				});
			} else {
				console.log("User does not exist");
				req.flash('error_msg', 'User does not exist');
				res.redirect("/login");
			}
		}
		else {
			console.error(errors);
			req.flash("error_msg", errors);
			res.redirect("/error"); 
		}
	}
	catch(err) {
		handleFailedLogin(req.body.email);
		//req.flash("error_msg", "Something happened! Please try again."); 
		console.error("Could not log in: ", err);
		req.flash("error_msg", err);
		res.redirect("/error"); 
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

// TODO: Change this to actually render all account information 
exports.viewAccounts = async (req, res) => {
	// just a dummy

	/*
	const entries = await userModel.getAllAccounts(); 

	res.render(
		"admin-panel", {
			"account-entry": entries
		}
	)
		*/

	try {
		entries = await userModel.getAllAccounts();;

		res.render(
			"admin-panel", {
			"account-entry": entries
		});
	}
	catch(error) {
		//console.log("Could not retrieve entries: ", error); 
		//res.redirect("/")
		req.flash("error_msg", error);
		res.redirect("/error"); 
	}
}

exports.getUser = async function (req, res) {
	try {
        const userId = req.query.id;
        const [user] = await userModel.getAccountEntry(userId);
        console.log([user]);
        res.render("view-user", user);
    } catch (error) {
        // console.log("Could not retrieve user: ", error);
        // res.redirect("/");
		req.flash("error_msg", error);
		res.redirect("/error"); 
    }
}

exports.getEditUser = async function (req, res) {
	try {
		const userId = req.query.id;
		const [user] = await userModel.getAccountEntry(userId);

		if(user === undefined) {
			throw new Error('Could not find entry'); 
		}

		res.render("edit-user", user)
	} catch (error) {
		// console.log("Could not retrieve user: ", error);
		// res.redirect("/");
		req.flash("error_msg", err);
		res.redirect("/error"); 
	}
}

exports.confirmEditUser = async function(req, res) {
    var newEdits = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone_number: req.body.phone_number
    }

	console.log("email:", newEdits.email);

	const userId = req.body.id; 

    try {
    	await userModel.editUser(userId, newEdits);
		const redirect = '/view/user?id=' + userId;
		return res.json({
			redirect: redirect
		});
    } catch (error) {
    	// console.log("Could not edit user: ", error);
    	// res.redirect("/");
		req.flash("error_msg", error);
		res.redirect("/error"); 
    }
}

exports.deleteUser = async function (req, res) {
	var userId = req.query.id;
	try {
		await userModel.deleteUser(userId);
		res.redirect('/admin-panel'); 
	}
	catch (error) {
		// console.log("Could not delete entry: ", error); 
		// res.redirect('/'); 
		req.flash("error_msg", err);
		res.redirect("/error"); 	
	}
}