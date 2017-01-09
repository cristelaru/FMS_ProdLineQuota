
/**
 * Module dependencies.
 */

var express = require("express");
//var routes = require('./routes');
//var user = require('./routes/user');
//var http = require('http');
//var path = require('path');



var passport = require("passport");
var flash = require("connect-flash");

var app = express();

var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

var DB = require('./config/database.js');

var port = process.env.PORT || 3000;
// all environments
//\
//app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());
//app.use(app.router);
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public')));
//\


require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms


app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret              : 'vacanebuna2014@ender', 
    resave              : true,
    saveUninitialized   : true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//\
//app.get('/', routes.index);
//app.get('/users', user.list);
//\

app.listen(port);
/*
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
*/