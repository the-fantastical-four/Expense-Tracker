const router = require('express').Router();
const {registerValidation, loginValidation, editAccountValidation} = require('../public/scripts/validator.js');
const { isPublic, isPrivate, isAdmin } = require('../middlewares/checkAuth.js');
const { upload, multerErrorHandler } = require('../middlewares/multerConfig.js');
const svgCaptcha = require('svg-captcha');
const { validateCaptcha, trackFailedAttempts } = require('../middlewares/validateCaptcha.js');
const controller = require("../controllers/controller");
const userController = require('../controllers/userController');
const logger = require('../middlewares/logger');

const { antiBruteForce, isBlacklisted } = require('../middlewares/antiBruteForce');
const fs = require('fs');
const path = require('path');
const errorHandler = require('../middlewares/errorHandler.js')


// ROUTES
router.use((req, res, next) => {
    res.locals.isAdmin = req.session.role === 'admin';
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

router.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({ size: 6, noise: 5 });
    req.session.captcha = captcha.text; // Store the captcha text in the session
    res.type('svg');
    res.status(200).send(captcha.data);
});

router.post('/log', logger.logRequest, errorHandler);

router.get('/', isPrivate, controller.getAllEntries, errorHandler);
router.get('/error', controller.errors);
router.get('/login', isPublic, controller.login);
router.get('/signup', isPublic, controller.signup);
router.post('/signup', isPublic, isBlacklisted, trackFailedAttempts, upload, multerErrorHandler, registerValidation, validateCaptcha, userController.registerUser, errorHandler);
router.post('/login', isPublic, loginValidation, isBlacklisted, antiBruteForce, userController.loginUser, errorHandler);
router.get('/logout', isPrivate, userController.logoutUser);
router.get('/admin-panel', isAdmin, userController.viewAccounts, errorHandler); // add validator isAdmin to check if user has admin role 
router.get('/new-entry', isPrivate, controller.newEntry); 
router.post('/add-entry', isPrivate, controller.addEntry, errorHandler); 
router.get('/view/entry', isPrivate, controller.getEntry, errorHandler);  
router.get('/delete/entry', isPrivate, controller.deleteEntry, errorHandler);
router.get('/edit/entry', isPrivate, controller.getEditEntry, errorHandler);
router.post('/edit/confirm', isPrivate, controller.confirmEditEntry, errorHandler);
router.get('/view/user', isAdmin, userController.getUser, errorHandler);
router.get('/edit/user', isAdmin, userController.getEditUser, errorHandler);
router.post('/edit/confirm-user', isAdmin, userController.confirmEditUser, errorHandler);
router.get('/delete/user', isAdmin, userController.deleteUser, errorHandler);



module.exports = router; 
