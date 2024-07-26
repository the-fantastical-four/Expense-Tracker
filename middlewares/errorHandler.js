function errorHandler(err, req, res, next) {
    if(process.env.MODE === 'DEBUG') {
        req.flash('error_msg', `Error: ${err.stack}`);
    }
    else {
        req.flash('error_msg', 'An unexpected error occurred. Please try again later'); 
    }
    return res.redirect('/error'); 
}

module.exports = errorHandler; 