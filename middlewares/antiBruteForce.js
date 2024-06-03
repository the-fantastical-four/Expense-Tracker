const nodemailer = require('nodemailer');
const users = new Map();  // This is a simple in-memory store. In production, use a persistent database.

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60 * 1000;  // 1 minute in milliseconds


function antiBruteForce(req, res, next) {
    const { email } = req.body;
    const now = Date.now();

    if (!users.has(email)) {
        users.set(email, { attempts: 0, lockUntil: 0 });
    }

    const user = users.get(email);

    if (user.lockUntil > now) {
        req.flash("error_msg", "Too many failed login attempts. Please try again later.");
        return res.redirect('/login');
    }

    next();
}

function handleFailedLogin(email) {
    const now = Date.now();
    const user = users.get(email);

    user.attempts += 1;

    if (user.attempts >= MAX_ATTEMPTS) {
        user.lockUntil = now + LOCK_TIME;
        user.attempts = 0;
    }

    users.set(email, user);
}

function handleSuccessfulLogin(email) {
    users.set(email, { attempts: 0, lockUntil: 0 });
}

module.exports = { antiBruteForce, handleFailedLogin, handleSuccessfulLogin };
