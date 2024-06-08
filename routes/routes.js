const router = require('express').Router();
const {registerValidation, loginValidation, editAccountValidation} = require('../public/scripts/validator.js');
const { isPublic, isPrivate, isAdmin } = require('../middlewares/checkAuth.js');
const { upload } = require('../middlewares/multerConfig.js');
const svgCaptcha = require('svg-captcha');
const { validateCaptcha, trackFailedAttempts } = require('../middlewares/validateCaptcha.js');


// importing controller
const controller = require("../controllers/controller");
const userController = require('../controllers/userController');

//anti-brute-force middleware
const { antiBruteForce } = require('../middlewares/antiBruteForce');


// ROUTES
router.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.userId !== undefined;
    res.locals.isAdmin = req.session.role === 'admin';
    next();
});

router.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({ size: 6, noise: 5 });
    req.session.captcha = captcha.text; // Store the captcha text in the session
    res.type('svg');
    res.status(200).send(captcha.data);
});

router.get('/', isPrivate, controller.getAllEntries);
router.get('/login', isPublic, controller.login);
router.get('/signup', isPublic, controller.signup);
router.post('/signup', isPublic, trackFailedAttempts, upload, registerValidation, validateCaptcha, userController.registerUser);
router.post('/login', isPublic, loginValidation, antiBruteForce, userController.loginUser);
router.get('/logout', isPrivate, userController.logoutUser);
router.get('/admin-panel', isAdmin, userController.viewAccounts); // add validator isAdmin to check if user has admin role 

module.exports = router; 