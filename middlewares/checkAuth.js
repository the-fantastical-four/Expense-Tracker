exports.isPrivate = (req, res, next) => {
    // Must be authenticated to go to the next function
    if (req.session.userId) {
        return next()
    } else {
        res.redirect('/login');
    }
};

exports.isPublic = (req, res, next) => {
    // If authenticated, go to home page
    if (req.session.userId) {
        res.redirect('/');
    } else {
        return next();
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        return next();
    }
    else {
        res.redirect('/');
    }
}