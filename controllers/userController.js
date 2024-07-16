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

				await logger.log({
					user: "",
					timestamp: timestamp,
					action: "REGISTER",
					targetPost: "",
					targetUser: "",
					result: "ERROR",
					message: "Email already in use",
					ip: req.ip
				});

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
					console.error('Error: No file uploaded');
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
						console.error(err);
						req.flash("error_msg", "Could not create user. Please try again.");

						await logger.log({
							user: "",
							timestamp: timestamp,
							action: "REGISTER",
							targetPost: "",
							targetUser: "",
							result: "ERROR",
							message: err,
							ip: req.ip
						});

						return res.redirect("/signup"); // Return here to prevent further execution
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
			console.error(err); 
			req.flash("error_msg", "Could not create user. Please try again.");

			await logger.log({
				user: "",
				timestamp: timestamp,
				action: "REGISTER",
				targetPost: "",
				targetUser: "",
				result: "ERROR",
				message: err,
				ip: req.ip
			});

			return res.redirect("/signup");

			// if fail maybe delete from auth table if new user was inserted 
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

						await logger.log({
							user: id,
							timestamp: timestamp,
							action: "LOGIN",
							targetPost: "",
							targetUser: "",
							result: "OK",
							message: "User logged in successfully",
							ip: req.ip
						});


						res.redirect("/")
					}
					else {
						handleFailedLogin(email, req, res);
						req.flash("error_msg", "Login credentials don't match");

						await logger.log({
							user: "",
							timestamp: timestamp,
							action: "LOGIN",
							targetPost: "",
							targetUser: "",
							result: "ERROR",
							message: "Login Failed - Login credentials don't match",
							ip: req.ip
						});

						return res.redirect("/login");
					}
				});
			} else {
				console.log("User does not exist");
				req.flash('error_msg', 'User does not exist');

				await logger.log({
					user: "",
					timestamp: timestamp,
					action: "LOGIN",
					targetPost: "",
					targetUser: "",
					result: "ERROR",
					message: "Login Failed - User does not exist",
					ip: req.ip
				});


				res.redirect("/login");
			}
		}
		else {
			console.error(errors); 
		}
	}
	catch(err) {
		handleFailedLogin(req.body.email);
		req.flash("error_msg", "Something happened! Please try again."); 
		console.error("Could not log in: ", err);

		await logger.log({
			user: "",
			timestamp: timestamp,
			action: "LOGIN",
			targetPost: "",
			targetUser: "",
			result: "ERROR",
			message: "Login Failed",
			ip: req.ip
		});

		res.redirect("/login"); 
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
exports.viewAccounts = async (req, res) => {
	try {
		entries = await userModel.getAllAccounts();;

		res.render(
			"admin-panel", {
			"account-entry": entries
		});
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
		console.log("Could not retrieve user: ", error);
		res.redirect("/");
	}
}

exports.confirmEditUser = async function(req, res) {
    var newEdits = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone_number: req.body.phone_number
    }

	const userId = req.body.id; 
	const adminUserId = req.session.userId;

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
    	console.log("Could not edit user: ", error);

		logger.log({
			user: adminUserId,
			timestamp: timestamp,
			action: "EDIT_USER",
			targetPost: "",
			targetUser: userId,
			result: "ERROR",
			message: `Failed to edit user with ID ${userId} by admin with ID ${adminUserId}`,
			ip: req.ip
		});

    	res.redirect("/");
    }
}

exports.deleteUser = async function (req, res) {
	const userId = req.query.id;
    const adminUserId = req.session.userId; // ID of the admin performing the deletion (assuming it's stored in the session)

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
		console.log("Could not delete entry: ", error); 

		logger.log({
            user: adminUserId,
            timestamp: timestamp,
            action: "DELETE_USER",
            targetPost: "",
            targetUser: userId,
            result: "FAILED",
            message: `Failed to delete user with ID ${userId} by admin with ID ${adminUserId}`,
            ip: req.ip
        });

		res.redirect('/'); 
	}
}