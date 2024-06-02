// init packages 
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session); 

const router = require("./routes/routes")

const app = new express();

const {
    envPort,
    dbConfig, 
    sessionKey
} = require('./config');

const mysql = require('mysql2'); 
const connection = mysql.createConnection(dbConfig); 
const sessionStore = new MySQLStore({}, connection); 

// init server port
//const port = 3000; 
var PORT = envPort || 3000;
var server = app.listen(PORT, function () {
    console.log("Listening at port " + PORT + "...");
});

const options = {
    useNewURLParser: true, 
    useUnifiedTopology: true
}

// Initialize data and static folder 
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // might change later
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
        secure: false
    }, // Set to true in production if using HTTPS
    store: sessionStore,
}));

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

