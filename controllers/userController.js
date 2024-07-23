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
			next(error);
		}
	});
}


exports.registerUser = async (req, res, next) => {
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
				req.flash(
					"error_msg",
					"Email already in use"
				);

				return res.redirect("/signup")
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
					req.flash(
						"error_msg",
						"Please upload an image"
					);
					return res.redirect('/signup');
				}

				bcrypt.hash(password, saltRounds, async function(err, hashed) {
					if (err) {
						next(err)
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
			next(err)

			// if fail maybe delete from auth table if new user was inserted 
		}
	} else {
		const messages = errors.array().map((item) => item.msg);
		
		deleteFile(req.file.path)

		req.flash("error_msg", messages.join(" "));
		return res.redirect("/signup");
	}
};

exports.loginUser = async (req, res, next) => {
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

						res.redirect("/")
					}
					else {
						handleFailedLogin(email, req, res);
						req.flash("error_msg", "Email and/or password does not match");
						return res.redirect("/login");
					}
				});
			} else {
				req.flash('error_msg', 'Email and/or password does not match');
				res.redirect("/login");
			}
		}
		else {
			const messages = errors.array().map((item) => item.msg);
			req.flash('error_msg', messages); 
			res.redirect("/login"); 
		}
	}
	catch(err) {
		handleFailedLogin(req.body.email);
		next(err)
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
exports.viewAccounts = async (req, res, next) => {
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
		next(error)
	}
}

exports.getUser = async function (req, res, next) {
	try {
        const userId = req.query.id;
        const [user] = await userModel.getAccountEntry(userId);
        res.render("view-user", user);
    } catch (error) {
		next(error)
    }
}

exports.getEditUser = async function (req, res, next) {
	try {
		const userId = req.query.id;
		const [user] = await userModel.getAccountEntry(userId);

		if(user === undefined) {
			throw new Error('Could not find entry'); 
		}

		res.render("edit-user", user)
	} catch (error) {
		next(error)
	}
}

exports.confirmEditUser = async function(req, res, next) {
    var newEdits = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone_number: req.body.phone_number
    }


	const userId = req.body.id; 

    try {
    	await userModel.editUser(userId, newEdits);
		const redirect = '/view/user?id=' + userId;
		return res.json({
			redirect: redirect
		});
    } catch (error) {
    	next(error)
    }
}

exports.deleteUser = async function (req, res, next) {
	var userId = req.query.id;
	try {
		await userModel.deleteUser(userId);
		res.redirect('/admin-panel'); 
	}
	catch (error) {
		next(error) 	
	}
}