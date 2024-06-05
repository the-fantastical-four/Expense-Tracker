const router = require('express').Router();
const {registerValidation, loginValidation, editAccountValidation} = require('../public/scripts/validator.js');
const { isPublic, isPrivate, isAdmin } = require('../middlewares/checkAuth.js');
const { upload } = require('../middlewares/multerConfig.js');

// importing controller
const controller = require("../controllers/controller");
const userController = require('../controllers/userController');

//anti-brute-force middleware
const { antiBruteForce, handleFailedLogin, handleSuccessfulLogin } = require('../middlewares/antiBruteForce');


// ROUTES
router.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.userId !== undefined;
    res.locals.isAdmin = req.session.role === 'admin';
    next();
});

router.get('/', isPrivate, controller.getAllEntries);
router.get('/login', isPublic, controller.login);
router.get('/signup', isPublic, controller.signup);
router.post('/signup', isPublic, upload, registerValidation, userController.registerUser);
router.post('/login', isPublic, loginValidation, antiBruteForce, userController.loginUser);
router.get('/logout', isPrivate, userController.logoutUser);
router.get('/admin-panel', isAdmin, userController.viewAccounts); // add validator isAdmin to check if user has admin role 

module.exports = router; 