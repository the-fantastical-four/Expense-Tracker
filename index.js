// init packages 
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const router = require("./routes/routes")

const app = new express();

const {
    envPort,
    conUrl, 
    sessionKey
} = require('./config');

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

const pgSession = require('connect-pg-simple')(session);
const {
    Pool
} = require('pg');

const pgPool = new Pool({
    connectionString: conUrl, // Your Supabase PostgreSQL URL
});

app.use(session({
    secret: sessionKey,
    store: new pgSession({
        pool: pgPool, // Connection pool
        tableName: 'session' // Table to store sessions
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
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

