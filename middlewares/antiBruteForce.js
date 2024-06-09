const nodemailer = require('nodemailer');
const users = new Map();  // This is a simple in-memory store. In production, use a persistent database.

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60 * 1000;  // 1 minute in milliseconds

let wasTimedOut = false; 

const userModel = require("../database/models/User");


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

function getIp(req) {
    let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (ipAddress === '::1') {
        ipAddress = '127.0.0.1';
    }
    else if (ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.split('::ffff:')[1];
    }

    return ipAddress; 
}

function handleFailedLogin(email, req, res) {
    const now = Date.now();
    const user = users.get(email);

    user.attempts += 1;

    if(wasTimedOut) {
        const ip = getIp(req);

        userModel.blacklistIp(ip); 
        console.log(`IP Address ${ip} is now blacklisted`)
    } 

    if (user.attempts >= MAX_ATTEMPTS) {
        user.lockUntil = now + LOCK_TIME;
        user.attempts = 0;
        wasTimedOut = true; 
    }

    users.set(email, user);
}

function handleSuccessfulLogin(email) {
    users.set(email, { attempts: 0, lockUntil: 0 });
}

async function isBlacklisted(req, res, next) {
    const ip = getIp(req); 
    
    const isBlacklisted = await userModel.isBlacklisted(ip);

    if(isBlacklisted) {
        req.flash('error_msg', 'Sorry you are blacklisted'); 
        return res.redirect('/login');
    }

    next(); 
}

module.exports = { antiBruteForce, handleFailedLogin, handleSuccessfulLogin, isBlacklisted };
