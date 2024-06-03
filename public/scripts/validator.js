const {body} = require('express-validator');

const registerValidation = [
    //Email check
    body('email')
        .not().isEmpty().withMessage("Please fill out the email section.")
        .matches(/^[a-zA-Z0-9]+([_.-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/)
        .withMessage('Invalid email format.\n'),


    //Username check
    body('fullName').not().isEmpty().withMessage("Please provide a name"),

    //Password check
    body('password')
        .not().isEmpty().withMessage("Please provide a password.")
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{12,64}$/)
        .withMessage('Password must be 12-64 characters long and include uppercase, lowercase, number, and special character.\n'),

    body('confirmPass').not().isEmpty().withMessage("Please provide a password")
    .custom((value, {req})=> {
        if (value !== req.body.password) {
            throw new Error("Passwords must match");
        }
        return true;
    })

];

const loginValidation = [
    // Email should not be empty and must be a valid email
    body('email').not().isEmpty().withMessage("Email is required."),
    // Password should not be empty and needs to be min 6 chars
    body('password').not().isEmpty().withMessage("Password is required.")
];

const editAccountValidation = [
    //Email check
    body('email').not().isEmpty().withMessage("Please fill out the email section.")
        .isEmail().withMessage("Please provide a valid email address."),

    //Username check
    body('username').not().isEmpty().withMessage("Please provide a username")
]

module.exports = {registerValidation, loginValidation, editAccountValidation};