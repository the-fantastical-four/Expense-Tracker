const router = require('express').Router();
const {registerValidation, loginValidation, editAccountValidation} = require('../public/scripts/validator.js');
const { isPublic, isPrivate, isAdmin } = require('../middlewares/checkAuth.js');
const { upload, multerErrorHandler } = require('../middlewares/multerConfig.js');
const svgCaptcha = require('svg-captcha');
const { validateCaptcha, trackFailedAttempts } = require('../middlewares/validateCaptcha.js');
const controller = require("../controllers/controller");
const userController = require('../controllers/userController');

const { antiBruteForce, isBlacklisted } = require('../middlewares/antiBruteForce');
const fs = require('fs');
const path = require('path');



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

router.post('/log', async (req, res) => {
    const logEntry = req.body;
    const logFilePath = path.join(__dirname, '../logs.json');

    try {
        const data = fs.readFileSync(logFilePath, 'utf8');
        const logs = JSON.parse(data);
        logs.push(logEntry);

        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
        res.status(200).send('Log saved');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/', isPrivate, controller.getAllEntries);
router.get('/login', isPublic, controller.login);
router.get('/signup', isPublic, controller.signup);
router.post('/signup', isPublic, isBlacklisted, trackFailedAttempts, upload, multerErrorHandler, registerValidation, validateCaptcha, userController.registerUser);
router.post('/login', isPublic, loginValidation, isBlacklisted, antiBruteForce, userController.loginUser);
router.get('/logout', isPrivate, userController.logoutUser);
router.get('/admin-panel', isAdmin, userController.viewAccounts); // add validator isAdmin to check if user has admin role 
router.get('/new-entry', isPrivate, controller.newEntry); 
router.post('/add-entry', isPrivate, controller.addEntry); 
router.get('/view/entry', isPrivate, controller.getEntry);  
router.get('/delete/entry', isPrivate, controller.deleteEntry);
router.get('/edit/entry', isPrivate, controller.getEditEntry);
router.post('/edit/confirm', isPrivate, controller.confirmEditEntry);
router.get('/view/user', isAdmin, userController.getUser);
router.get('/edit/user', isAdmin, userController.getEditUser);
router.post('/edit/confirm-user', isAdmin, userController.confirmEditUser);
router.get('/delete/user', isAdmin, userController.deleteUser);



module.exports = router; 
