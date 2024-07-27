const { check } = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { handleFailedLogin, handleSuccessfulLogin } = require('../middlewares/antiBruteForce');
const { checkIfImage } = require('../middlewares/multerConfig')
const logger = require('../middlewares/logger');

const moment = require('moment-timezone');
const timezone = moment.tz.guess();

const timestamp = moment().tz(timezone).format();
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

						await logger.log({
							user: "",
							timestamp: timestamp,
							action: "REGISTER",
							targetPost: "",
							targetUser: "",
							result: "ERROR",
							message: "Image file not supported",
							ip: req.ip
						});

						return res.redirect('/signup');
					}
				} else { 
					req.flash(
						"error_msg",
						"Please upload an image"
					);

					await logger.log({
						user: "",
						timestamp: timestamp,
						action: "REGISTER",
						targetPost: "",
						targetUser: "",
						result: "ERROR",
						message: "No file uploaded",
						ip: req.ip
					});

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

					await logger.log({
						user: "",
						timestamp: timestamp,
						action: "REGISTER",
						targetPost: "",
						targetUser: "",
						result: "OK",
						message: "User registered successfully",
						ip: req.ip
					});

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
		}
	} else {
		const messages = errors.array().map((item) => item.msg);
		
		deleteFile(req.file.path)

		req.flash("error_msg", messages.join(" "));

		await logger.log({
			user: "",
			timestamp: timestamp,
			action: "REGISTER",
			targetPost: "",
			targetUser: "",
			result: "ERROR",
			message: `Validation errors: ${messages.join(", ")}`,
			ip: req.ip
		});


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
			const userId = req.session.userId;
			req.session.destroy(() => {
				res.clearCookie('connect.sid');
				res.redirect('/login');
			});

			logger.log({
				user: userId,
				timestamp: timestamp,
				action: "LOGOUT",
				targetPost: "",
				targetUser: "",
				result: "OK",
				message: "Logout Successful",
				ip: req.ip
			});
		}
	}
	else {
		res.redirect('/login'); 

		logger.log({
			user: "UNKNOWN",
			timestamp: timestamp,
			action: "LOGOUT_ATTEMPT_WITHOUT_SESSION",
			targetPost: "",
			targetUser: "",
			result: "FAILED",
			message: "Logout attempt failed because no session was found",
			ip: req.ip
		});
	}
};

// TODO: Change this to actually render all account information 
exports.viewAccounts = async (req, res, next) => {
	try {
		entries = await userModel.getAllAccounts();

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
	}
	catch(error) {
		console.log("Could not retrieve entries: ", error); 
		res.redirect("/")
	}
}

exports.getUser = async function (req, res) {
	try {
        const userId = req.query.id;
        const [user] = await userModel.getAccountEntry(userId);
        console.log([user]);
        res.render("view-user", user);
    } catch (error) {
        console.log("Could not retrieve user: ", error);
        res.redirect("/");
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
	const adminUserId = req.session.userId;

	if(userId === adminUserId) {
		throw new Error('Unauthorized access'); 
	}

    try {
    	await userModel.editUser(userId, newEdits);
		const redirect = '/view/user?id=' + userId;

		logger.log({
			user: adminUserId,
			timestamp: timestamp,
			action: "EDIT_USER",
			targetPost: "",
			targetUser: userId,
			result: "SUCCESS",
			message: `User with ID ${userId} was successfully edited by admin with ID ${adminUserId}`,
			ip: req.ip
		});
      
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

		logger.log({
			user: adminUserId,
			timestamp: timestamp,
			action: "DELETE_USER",
			targetPost: "",
			targetUser: userId,
			result: "SUCCESS",
			message: `User with ID ${userId} was successfully deleted by admin with ID ${adminUserId}`,
			ip: req.ip
		});
    
		res.redirect('/admin-panel'); 
	}
	catch (error) {
    next(error) 
	}
}