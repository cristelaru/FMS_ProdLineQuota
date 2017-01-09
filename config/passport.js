// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
//var SignupStrategy = require('../app/models/signupstrategy');

// load up the user model
var User = require('../app/models/user');
var DB = require('./database.js');

// expose this function to our app using module.exports
module.exports = function (passport) {
    
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.local.username + " (" + user.local.name + ")");
    });
    
    // used to deserialize the user
    passport.deserializeUser(function (username, done) {
        var realUN = username.substring(0, username.indexOf(" ("));
        DB.dbConn.findUser(null, realUN, "", true, done, function (err, urlreq, password, done) {
          return done(err, User.RegUser);
        });
        //User.findById(username, function (err, user) {
        //    done(err, user);
        //});
    });
    
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    /*passport.use('local-signup', new Strategy({
        //\ // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        nameField     : 'name',
        passwordField : 'password',
        emailField : 'email',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },*/
    passport.use('local-profile', new LocalStrategy({
        //\ // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    //function (req, username, name, password, email, done) {
     function (urlreq, username, password, done) {
        process.nextTick(function () {
            switch (urlreq.body.usersFormSubmit) {
                case "InsertNew"://Introduc un nou utilizator
                    if ((urlreq.body.username == "New User") && (urlreq.body.password == "New User")) {
                        return done(null, false, urlreq.flash('profileMessage', 'That username is restricted'));
                    }
                    var loadUser = false;
                    return DB.dbConn.findUser(urlreq, urlreq.body.username, urlreq.body.password, loadUser, done, function (err, urlreq, password, done) {  //var DBLocalErr = DB.dbConn.localError;
                        if (err) return done(null, false, urlreq.flash('profileMessage', err.message));
                        if (password == "") {
                            //  DB.dbConn.CloseConn();
                            //throw new Error('That username is already taken.');
                            return done(null, false, urlreq.flash('profileMessage', 'That username is already taken.'));
                        }
                        else {
                            return DB.dbConn.insertNewUser(urlreq,urlreq.body.username, urlreq.body.UserName, 
                                                           User.RegUser.generateHash(urlreq.body.password), urlreq.body.Email, done,
                        function (err, urlreq, done) {
                                if (err) return done(null, false, urlreq.flash('profileMessage', err.message));
                                return done(null, User.RegUser);
                            });//.catch(function (err) {
                                //throw err;
                                //  return done(null, false, urlreq.flash('profileMessage', err.message));
                                //});
                                // DB.dbConn.CloseConn();                  
                            }
                        });//.catch(function (err) {
                        //   throw err;
                        //  return done(null, false, urlreq.flash('profileMessage', err.message));
                        // });
                    break;
                default://Update sau delete utilizator                   
                    var loadUser = false;
                    var subCmd = urlreq.body.usersFormSubmit.substr(0, 7);
                    
                    switch (subCmd) {
                        case "btnDel_": //DELETE USER
                            var UCode = urlreq.body.usersFormSubmit.substr(7);
                            var UName = urlreq.body[UCode + "`~`UserCode"];
                            // var UPass = "pass";
                            //  var FullName = urlreq.body[UCode + "`~`UserName"];
                            //  var UEmail = urlreq.body[UCode + "`~`Email"];
                            
                            /* return DB.dbConn.findUser(urlreq, UName, "pass", loadUser, done, function (err, urlreq, password, done) {  //var DBLocalErr = DB.dbConn.localError;
                            if (err) return done(null, false, urlreq.flash('profileMessage', err.message));
                            if (password != "") {
                                //  DB.dbConn.CloseConn();
                                //throw new Error('That username is already taken.');
                                return done(null, false, urlreq.flash('profileMessage', 'That username does not exist.'));
                            }
                            else {*/
                            if (UCode == User.RegUser.local.username) return done(null, false, urlreq.flash('profileMessage', 'You cannot delete your own user!'));
                            else return DB.dbConn.deleteUser(urlreq, UCode, done,
                                        function (err, urlreq, done) {
                                            if (err) return done(null, false, urlreq.flash('profileMessage', err.message));
                                            return done(null, User.RegUser);
                                        });//.catch(function (err) {
                            //throw err;
                            //  return done(null, false, urlreq.flash('profileMessage', err.message));
                            //});
                            // DB.dbConn.CloseConn();                  
                            /* }
                            });*/
                            break
                        case "btnUpd_":  //UPDATE USER
                            var UCode = urlreq.body.usersFormSubmit.substr(7);
                            var UName = urlreq.body[UCode + "`~`UserCode"];
                            var UPass = urlreq.body[UCode + "`~`Pass"];
                            var FullName = urlreq.body[UCode + "`~`UserName"];
                            var UEmail = urlreq.body[UCode + "`~`Email"];
                            
                            if (UPass == "") UPass = null;
                            else UPass = User.RegUser.generateHash(UPass);
                            
                            return DB.dbConn.updateUser(urlreq, UCode, UName, FullName, UPass, UEmail, done,
                                        function (err, urlreq, done) {
                                if (err) return done(null, false, urlreq.flash('profileMessage', err.message));
                                return done(null, User.RegUser);
                            });
                            break;
                        //case "btnPrd_":
                        //    var UCode = urlreq.body.usersFormSubmit.substr(7);
                            
                        //   return DB.dbConn.getUserProdLines(urlreq, UCode, done, function (err, urlreq, usercode, recordset, done) {
                        //        if (err) return done(err);
                                
                        //        done.render('uprodlines.ejs', {
                        //            message: req.flash('uplMessage'), 
                        //            user : req.user,
                        //            currentuser : usercode,
                        //            items : recordset
                        //        });
                        //    });

                        //    break;
                        default:
                            //other options here
                            ;
                    }
                    //if (urlreq.body.usersFormSubmit.startsWith("btnDel_")) { //Delete user
                        
                    //}
                    //else {
                    //    if (urlreq.body.usersFormSubmit.startsWith("btnUpd_")) { //Update user
                    //        //\
                            

                            
                    //    }
                    //}
            }
            
        });//.catch(function (err) {
         //   return done(null, false, urlreq.flash('profileMessage', err.message));
       // });
    }));
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function (urlreq, username, password, done) { // callback with email and password from our form
        
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
      //  DB.dbConn.OpenConn(req,done);
      //  if (!DB.dbConn.isConnected ) {
      //      if (DB.dbConn.localError == '') { return done(null, false, req.flash('loginMessage', 'Connection to database failed')); }
      //      else { return done(null, false, req.flash('loginMessage', DB.dbConn.localError))};
    //  }
    var loadUser = true; 
        DB.dbConn.findUser(urlreq, username, password, loadUser, done, function (err, urlreq, password, done) {
            //var DBLocalErr = DB.dbConn.localError;
            // DB.dbConn.CloseConn();
             if (err) return done(null, false, urlreq.flash('loginMessage', err.message));
            
            if (User.RegUser.local.username == username) {
                if (!User.RegUser.validPassword(password)) {
                    return done(null, false, urlreq.flash('loginMessage', 'Oops! Wrong password.'));
                }
                else {
                    return done(null, User.RegUser);
                }
            }
            else {
                return done(null, false, urlreq.flash('loginMessage', 'No such user.'));
            }
        });//.catch(function (err) {
         //   return done(null, false, urlreq.flash('loginMessage', err.message));
       // });
       

        //User.findOne({ 'local.username' : username }, function (err, user) {
        //    // if there are any errors, return the error before anything else
        //    if (err)
        //        return done(err);
            
        //    // if no user is found, return the message
        //    if (!user)
        //        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            
        //    // if the user is found but the password is wrong
        //    if (!user.validPassword(password))
        //        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            
        //    // all is well, return successful user
        //    return done(null, user);
        //});

    }));


};