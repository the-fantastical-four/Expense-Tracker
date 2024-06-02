const { check } = require("express-validator");
const userModel = require("../database/models/User");
const postModel = require("../database/models/Post");
const upload = require('../middlewares/upload');
const fs = require('fs').promises;

const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.registerUser = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            req.flash('error_msg', err + " Entered here 1");
            return res.redirect('/signup');
        }

        const file = req.file;
        if (!file) {
            req.flash('error_msg', 'Please upload a profile picture.');
            return res.redirect('/signup');
        }

        // Check file signature
        try {
            const buffer = await fs.readFile(file.path);
            const fileSignature = buffer.toString('hex', 0, 4);

            // Image file signatures
            const jpgSignature = 'ffd8ffe0';
            const gifSignature = '47494638';
            const pngSignature = '89504e47';
            const jpegSignature = 'ffd8ffe1';

            if (
                fileSignature !== jpgSignature &&
                fileSignature !== gifSignature &&
                fileSignature !== pngSignature &&
                fileSignature !== jpegSignature
            ) {
                req.flash('error_msg', 'Invalid file type. Please upload a valid image.');
                await fs.unlink(file.path); // Delete the invalid file
                return res.redirect('/signup');
            }

        } catch (fileErr) {
            req.flash('error_msg', 'Could not process the file. Please try again.' + fileErr);
            return res.redirect('/signup');
        }
		console.log(req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((item) => item.msg);
            req.flash("error_msg", messages.join(" "));
            return res.redirect('/signup');
        }

        const { fullName, email, phoneNumber, password } = req.body;

        try {
            const emailExists = await userModel.checkEmailExists(email);

            if (emailExists) {
                req.flash("error_msg", "Email already in use");
                return res.redirect("/signup");
            }

            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async (err, hashed) => {
                if (err) {
                    req.flash("error_msg", "Could not hash the password. Please try again.");
                    return res.redirect('/signup');
                }

                const newUser = {
                    full_name: fullName,
                    email: email,
                    password: hashed,
                    phone_number: phoneNumber,
                    profile_picture: file.filename // Store the filename or the path as needed
                };

                try {
                    await userModel.createUser(newUser);
                    req.flash("success_msg", "You are now registered! Please login.");
                    res.redirect("/login");
                } catch (createErr) {
                    req.flash("error_msg", "Could not create user. Please try again.");
                    res.redirect('/signup');
                }
            });

        } catch (err) {
            req.flash("error_msg", "Could not create user. Please try again.");
            res.redirect('/signup');
        }
    });
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