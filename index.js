// init packages 
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session); 
const helmet = require('helmet');

const router = require("./routes/routes")

const https = require('https');
require('./middlewares/setupCerts');
const fs = require('fs');
const path = require('path');

const app = new express();

const {
    envPort,
    dbConfig, 
    sessionKey
} = require('./config');

const crypto = require('crypto');
const mysql = require('mysql2'); 
const connection = mysql.createConnection(dbConfig); 
const sessionStore = new MySQLStore({
    clearExpired: true, // Enable automatic cleanup of expired sessions
    checkExpirationInterval: 60000, // How frequently expired sessions will be cleared; here it's set to 15 minutes
    expiration: 60000 
}, connection);

const options = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt')),
};


https.createServer(options, app).listen(envPort || 3000, () => {
    console.log(`Run on https://localhost:${envPort || 3000}`);
});
  
// Initialize data and static folder 
app.use(express.json());
app.use(express.urlencoded({ extended: true })) 
app.use(express.static(__dirname + "/public")); // place all html, js, css for the pages here

// using handlebars 
app.set('view engine', 'hbs');
app.engine("hbs", exphbs.engine({ 
    extname: "hbs", 
    helpers: require(__dirname + '/public/hbs-helpers/helpers.js')
}));

app.use(session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // basically makes cookies secure, only turn on if HTTPS!!! 
        httpOnly: true, // prevent client-side JavaScript from accessing the cookie
        sameSite: 'strict', // helps protect against CSRF attacks
        maxAge: 60 * 1000 // 1 min
    }, // Set to true in production if using HTTPS 
    store: sessionStore,
}));

app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce; 
    next();
});

app.use(
    helmet({
        contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
                    objectSrc: ["'none'"],
                    fontSrc: ["'self'", "https:", "data:"], // Adjust font sources if necessary
                    upgradeInsecureRequests: []
                }
            },
            xssFilter: true
    })
);

//FLASH
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', router); 

