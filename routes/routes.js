const router = require('express').Router();
const {registerValidation, loginValidation, editAccountValidation} = require('../public/scripts/validator.js');
const { isPublic, isPrivate } = require('../middlewares/checkAuth.js');

// importing controller
const controller = require("../controllers/controller");
const userController = require('../controllers/userController');

// ROUTES
router.get('/', isPrivate, controller.getAllEntries);
router.get('/login', isPublic, controller.login);
router.get('/signup', isPublic, controller.signup);
router.post('/signup', isPublic, registerValidation, userController.registerUser);
router.post('/login', isPublic, loginValidation, userController.loginUser);
router.get('/logout', isPrivate, userController.logoutUser);
router.get('/account', isPrivate, userController.viewAccount);
router.get('/admin-panel', isPrivate, userController.viewAccounts); // add validator isAdmin to check if user has admin role 

module.exports = router; 