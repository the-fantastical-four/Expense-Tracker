const logger = require('../middlewares/logger');

const moment = require('moment-timezone');
const timezone = moment.tz.guess();

const timestamp = moment().tz(timezone).format();
const fs = require('fs')

function validateCaptcha(req, res, next) {
    const userCaptcha = req.body.captcha;
    if (userCaptcha === req.session.captcha) {
        next(); // CAPTCHA is correct, proceed to next middleware
    } else {
        // Check if failed attempts exceed threshold and set lockout time
        if (req.session.failedAttempts >= 3) {
            req.session.lockedOut = true;
            req.session.lockoutTime = new Date().getTime();
            req.flash('error_msg', 'You have tried 3 times. You are now locked out for 1 minute.');
            logger.log({
                user: "",
                timestamp: timestamp,
                action: "REGISTER",
                targetPost: "",
                targetUser: "",
                result: "ERROR",
                message: "CAPTCHA Failed - Locked Out",
                ip: req.ip
            });
        }
        else {
            req.flash('error_msg', 'CAPTCHA verification failed. Please try again.');
            req.session.failedAttempts++; // Increment failed attempts count

            logger.log({
                user: "",
                timestamp: timestamp,
                action: "REGISTER",
                targetPost: "",
                targetUser: "",
                result: "ERROR",
                message: "CAPTCHA Failed",
                ip: req.ip
            });
        }

        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Failed to accomodate change');
            }
        });
        
        res.redirect('/signup');
    }
}

function trackFailedAttempts(req, res, next) {
    // Initialize failed attempts count
    if (!req.session.failedAttempts) {
        req.session.failedAttempts = 0;
    }

    // Initialize lockout status and lockout time
    if (req.session.lockedOut === undefined) {
        req.session.lockedOut = false;
    }
    if (req.session.lockoutTime === undefined) {
        req.session.lockoutTime = null;
    }

    // Check if user is currently locked out and if lockout duration has elapsed
    if (req.session.lockedOut && req.session.lockoutTime !== null) {
        const lockoutDuration = 1 * 60 * 1000; // 1 minute in milliseconds
        const currentTime = new Date().getTime();
        if (currentTime - req.session.lockoutTime >= lockoutDuration) {
            // Lockout duration has elapsed, reset failed attempts and lockout status
            req.session.failedAttempts = 0;
            req.session.lockedOut = false;
            req.session.lockoutTime = null;
        } else {
            // User is still locked out
            req.flash('error_msg', 'You are currently locked out. Please try again later.');
            
            logger.log({
                user: "",
                timestamp: timestamp,
                action: "REGISTER",
                targetPost: "",
                targetUser: "",
                result: "ERROR",
                message: "CAPTCHA Failed - Locked Out",
                ip: req.ip
            });
            
            return res.redirect('/signup');
        }
    }
    next();
}


module.exports = { validateCaptcha, trackFailedAttempts };
