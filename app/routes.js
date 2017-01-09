//app/routes.js
var DB = require('../config/database.js');

module.exports = function (app, passport){
    
    //\
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
    });
    
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/produced', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    

    
    // =====================================
    // PROFILE ==============================
    // =====================================
    app.get('/profile', isLoggedIn , function (req, res) {
        DB.dbConn.getUsers(req, false, res, function (err,req,coloane,recordset,res) {
            var errMsg = "";
            if (err) errMsg = err.message;
            if (errMsg != "")
                res.render('profile.ejs', {
                    message: req.flash('profileMessage',errMsg), 
                    user : req.user,
                    columns : null,
                    items : null
                });
            else
                res.render('profile.ejs', {
                    message: req.flash('profileMessage'), 
                    user : req.user,
                    columns : coloane,
                    items : recordset
                });
        });
        // render the page and pass in any flash data if it exists
       
    });
    
    // process the signup form
    app.post('/profile', passport.authenticate('local-profile', {
        successRedirect : '/profile', // redirect to the secure profile section  /\ '/profile'
        failureRedirect : '/profile', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // USER PRODUCTION LINES ===============
    // =====================================
    app.get('/uprodlines', isLoggedIn , function (req, res) {
        DB.dbConn.getUsers(req, true, res, function (err, req, coloane, recordset, res) {
            var errMsg = "";
            if (err) errMsg = err.message;
            if (errMsg != "")
                res.render('uprodlines.ejs', {
                    message: req.flash('uplMessage',errMsg),
                    status: null,
                    user : req.user,
                    currentuser : null,
                    users: recordset,
                    items : null,
                    filter: null
                });
            else
                res.render('uprodlines.ejs', {
                    message: req.flash('uplMessage'),
                    status: null,
                    user : req.user,
                    currentuser : null,
                    users: recordset,
                    items : null,
                    filter: null
                });
        });
    });
    app.post('/uprodlines', function (req, res) {
       var subCmd = req.body.uplFormSubmit;
        switch (subCmd) {
            case "Modify":
              return DB.dbConn.updateUserProdLines(req, req.body.selecteduser, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message + "\n";
                    return DB.dbConn.getUserProdLines(req, req.body.selecteduser, null, res, function (err, req, username, filter, records, users, res) {
                        if (err) errMsg += err.message;
                        if (errMsg != "")
                            res.render('uprodlines.ejs', {
                                message: req.flash('uplMessage',errMsg),
                                status: null,
                                user : req.user,
                                currentuser : username,
                                users: users,
                                items : records,
                                filter : filter
                            });
                        else
                            res.render('uprodlines.ejs', {
                                message: req.flash('uplMessage'),
                                status: "Update successful.",
                                user : req.user,
                                currentuser : username,
                                users: users,
                                items : records,
                                filter : filter
                            });
                    });
                              //  res.redirect('/uprodlines');                        
                });
              break;
            case "UpdateForUser":
                return DB.dbConn.getUserProdLines(req, req.body.selecteduser, null, res, function (err, req, username, filter, records, users, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message;
                    if (errMsg != "")
                        res.render('uprodlines.ejs', {
                            message: req.flash('uplMessage',errMsg),
                            status: null,
                            user : req.user,
                            currentuser : username,
                            users: users,
                            items : records,
                            filter : filter
                        });
                    else
                        res.render('uprodlines.ejs', {
                            message: req.flash('uplMessage'),
                            status: null,
                            user : req.user,
                            currentuser : username,
                            users: users,
                            items : records,
                            filter : filter
                        });
                });
                break;
            case "FilterForUser":
                var filter = req.body.filterProdLineCode;
                return DB.dbConn.getUserProdLines(req, req.body.selecteduser, filter, res, function (err, req, username, filter, records, users, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message;
                    if (errMsg != "")
                        res.render('uprodlines.ejs', {
                            message: req.flash('uplMessage',errMsg),
                            status: null,
                            user : req.user,
                            currentuser : username,
                            users: users,
                            items : records,
                            filter: filter
                        });
                    else
                        res.render('uprodlines.ejs', {
                            message: req.flash('uplMessage'),
                            status: null,
                            user : req.user,
                            currentuser : username,
                            users: users,
                            items : records,
                            filter: filter
                        });
                });
                break;
            default:
                res.render('uprodlines.ejs', {
                    message: req.flash('uplMessage'),
                    status: null,
                    user : req.user,
                    currentuser : null,
                    users: null,
                    items : null,
                    filter: null
                });
        }
        
    });
    
    // =======================================
    // PRODUCTION LINES QUOTA  ===============
    // =======================================
    app.get('/plquotas', isLoggedIn , function (req, res) {
        DB.dbConn.getQuotas(req, null, res, function (err, req, filter, recordset, res) {
            var errMsg = "";
            if (err) errMsg = err.message;
            if (errMsg != "")
                res.render('plquotas.ejs', {
                    message: req.flash('plqMessage',errMsg),
                    status: null,
                    user : req.user,
                    items : recordset,
                    filter: filter
                });
            else
                res.render('plquotas.ejs', {
                    message: req.flash('plqMessage'),
                    status: null,
                    user : req.user,
                    items : recordset,
                    filter: filter
                });
        });
    });
    app.post('/plquotas', function (req, res) {
        var subCmd = req.body.uplFormSubmit;
        switch (subCmd) {
            case "Modify":                
                return DB.dbConn.updateQuota(req, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message;
                   // if (err) return res(null, false, req.flash('plqMessage', err.message));
                    return DB.dbConn.getQuotas(req, null, res, function (err, req, filter, recordset, res) {
                        if (err) errMsg += err.message;
                        if (errMsg != "")
                            res.render('plquotas.ejs', {
                                message: req.flash('plqMessage', errMsg),
                                status: null,
                                user : req.user,
                                items : null,
                                filter: null
                            });
                        else
                            res.render('plquotas.ejs', {
                                message: req.flash('plqMessage'),
                                status: "Update successful.",
                                user : req.user,
                                items : recordset,
                                filter: filter
                            });
                    });                          
                });
                
                break;
           case "FilterQuotas":
                var filter = req.body.filterProdLineCode;
                return DB.dbConn.getQuotas(req, filter, res, function (err, req, filter, recordset, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message;
                    if (errMsg != "")
                        res.render('plquotas.ejs', {
                            message: req.flash('plqMessage',errMsg),
                            status: null,
                            user : req.user,
                            items : recordset,
                            filter: filter
                        });
                    else
                        res.render('plquotas.ejs', {
                            message: req.flash('plqMessage'),
                            status: null,
                            user : req.user,
                            items : recordset,
                            filter: filter
                        });
                });      
                break;
            default:
                res.render('plquotas.ejs', {
                    message: req.flash('plqMessage'),
                    status: null,
                    user : req.user,
                    items : null,
                    filter: null
                });
        }
        
    });
    
    // =======================================
    // CLOSING DAYS  =========================
    // =======================================
    app.get('/produced', isLoggedIn , function (req, res) {
        DB.dbConn.getQuotaOfProdLines(req, res, function (err, req, recordset, res) {
            var msgErr = "";
            if (err) msgErr = err.message;
            if (msgErr != "") {
                res.render('produced.ejs', {
                    message: req.flash('prodMessage',msgErr),
                    status: null,
                    user : req.user,
                    items : recordset
                });
            }
            else {
                res.render('produced.ejs', {
                    message: req.flash('prodMessage'),
                    status: null,
                    user : req.user,
                    items : recordset
                });
            }
            
        });
    });
    app.post('/produced', function (req, res) {
        return DB.dbConn.updateProduced(req, res, function (err, req, dates, prodLines, res) {
            var msgErr = "";
            if (err) {
                // req.flash('prodMessage', err.message);
                msgErr = err.message + "\n";
                return DB.dbConn.getQuotaOfProdLines(req, res, function (err, req, recordset, res) {
                    var msgStatus = null;
                    if (err) msgErr +=  err.message;
                   // else msgStatus = 'Day closed succesful';
                    if (msgErr != "") {
                        res.render('produced.ejs', {
                            message: req.flash('prodMessage', msgErr),
                            status: null,
                            user : req.user,
                            items : null
                        });

                    }
                    else {
                        //res.render('produced.ejs', {
                        //    message: req.flash('prodMessage'),
                        //    status: msgStatus,
                        //    user : req.user,
                        //    items : recordset
                        //});
                    }
                });
            }

               
            DB.dbConn.sendEmail(req, dates, prodLines, res, function (err, req, res, callback) {
               // return callback(null, urlreq, done);
                if (err) msgErr = err.message + "\n";
                return DB.dbConn.getQuotaOfProdLines(req, res, function (err, req, recordset, res) {
                    var msgStatus = null;
                    if (err) {
                        msgErr += err.message;
                        msgStatus = 'Day closed succesful. E-mail send failed.';
                    }
                    else msgStatus = 'Day closed succesful. E-mail sent.';
                    if (msgErr != "") {
                        res.render('produced.ejs', {
                            message: req.flash('prodMessage', msgErr),
                            status: msgStatus,
                            user : req.user,
                            items : null
                        });

                    }
                    else {
                        res.render('produced.ejs', {
                            message: req.flash('prodMessage'),
                            status: msgStatus,
                            user : req.user,
                            items : recordset
                        });
                    }
                });
            });
        
        });
        
    });
    
    // =======================================
    // SETTINGS  =============================
    // =======================================
    app.get('/settings', isLoggedIn, function (req, res) {
        DB.dbConn.getUsers(req, true, res, function (err, req, coloane, userCodes, res) {
            var errMsg ="";
            if (err) errMsg = err.message + "\n";
                  
            return DB.dbConn.getSettings(req, res, function (err, req, recordset, res) {
                if (err) errMsg += err.message;
                if (errMsg != "")
                    res.render('settings.ejs', {
                        message: req.flash('settingsMessage', errMsg),
                        status: null,
                        user : req.user,
                        users : null,
                        items : null
                    });
                else
                    res.render('settings.ejs', {
                        message: req.flash('settingsMessage'),
                        status: null,
                        user : req.user,
                        users : userCodes,
                        items : recordset
                    });
            });
        });
    });
    app.post('/settings', function (req, res) {
        var subCmd = req.body.settingsFormSubmit;
        switch (subCmd) {
            case "Modify":                
                return DB.dbConn.updateSettings(req, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message + "\n";
                    return DB.dbConn.getUsers(req, true, res, function (err,req, coloane, userCodes, res) {
                       return DB.dbConn.getSettings(req, res, function (err, req, recordset, res) {
                            if (err) errMsg += err.message;
                            if (errMsg != "")
                                res.render('settings.ejs',{
                                    message: req.flash('settingsMessage',errMsg),
                                    status: null,
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                            else
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage'),
                                    status: "Update successful.",
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                        });
                    });
                });
                
                break;
            case "CreateAdmin":
                var username = req.body.selecteduser;
                return DB.dbConn.createAdminUser(req, username, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message + "\n";
                    //if (err) return res(null, false, req.flash('settingsMessage', err.message));
                    return DB.dbConn.getUsers(req, true, res, function (err,req, coloane, userCodes, res) {
                        return DB.dbConn.getSettings(req, res, function (err, req, recordset, res) {
                            if (err) errMsg += err.message;
                            if (errMsg != "")
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage',errMsg),
                                    status: null,
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                            else
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage'),
                                    status: "Rights granted.",
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                        });
                    });
                });
                break;
            case "RevokeAdmin":
                var username = req.body.selecteduser;
                return DB.dbConn.revokeAdminUser(req, username, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message + "\n";
                   // if (err) return res(null, false, req.flash('settingsMessage', err.message));
                    return DB.dbConn.getUsers(req, true, res, function (err,req, coloane, userCodes, res) {
                        return DB.dbConn.getSettings(req, res, function (err, req, recordset, res) {
                            if (err) errMsg += err.message;
                            if (errMsg != "")
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage',errMsg),
                                    status: null,
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                            else
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage'),
                                    status: "Rights revoked.",
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                        });
                    });
                });
                break;
            case "GetMissingPL":
                return DB.dbConn.getPLFromFMS(req, res, function (err, req, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message + "\n";
                    return DB.dbConn.getUsers(req, true, res, function (err, req, coloane, userCodes, res) {
                        return DB.dbConn.getSettings(req, res, function (err, req, recordset, res) {
                            if (err) errMsg += err.message;
                            if (errMsg != "")
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage',errMsg),
                                    status: null,
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                            else
                                res.render('settings.ejs', {
                                    message: req.flash('settingsMessage'),
                                    status: "Import successful.",
                                    user : req.user,
                                    users : userCodes,
                                    items : recordset
                                });
                        });
                    });
                });
                break;
            default:
                res.render('settings.ejs', {
                    message: req.flash('settingsMessage'),
                    status: null,
                    user : req.user,
                    users : null,
                    items : null
                });
        }
        
    });
    
    // =======================================
    // HISTORY  ==============================
    // =======================================    
    app.get('/history', isLoggedIn , function (req, res) {
      //  DB.dbConn.getHistory(req, null, null, null, null, res, function (err, req, filter, dStart, dEnd, freq, recordset, res) {
       //     var errMsg = "";
       //     if (err) errMsg = err.message;
       //     if (errMsg != "")
                res.render('history.ejs', {
                    message: req.flash('plqMessage'),
                    user : req.user,
                    frequency : null,
                    items : null,
                    filter: null,
                    dStart: null,
                    dEnd: null
                });
        //    else
        //        res.render('history.ejs', {
        //            message: req.flash('plqMessage'),
        //            status: null,
        //            user : req.user,
        //            frequency : freq,
        //            items : recordset,
        //            filter: filter,
        //            dStart: dStart,
        //            dEnd: dEnd
        //        });
        //});
    });
    app.post('/history', function (req, res) {
        var subCmd = req.body.histFormSubmit;
        switch (subCmd) {            
            case "FilterHistory":
                var filter = req.body.filterProdLineCode;
                var freq = req.body.filterFreq;
                var dataStart = req.body.filterStartDate;
                var dataEnd = req.body.filterEndDate;
                var data, dd, mm, yyyy, dStart, dEnd;

                if (dataStart != "") {
                    data = new Date(dataStart);
                    var dd = data.getDate();
                    var mm = data.getMonth() + 1; //January is 0!
                    var yyyy = data.getFullYear();
                    
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    
                    dStart = yyyy + "-" + mm + "-" + dd;
                }
                else dStart = "2011-01-01";

                if (dataEnd != "") {
                    data = new Date(dataEnd);
                    var dd = data.getDate();
                    var mm = data.getMonth() + 1; //January is 0!
                    var yyyy = data.getFullYear();
                    
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    
                    dEnd = yyyy + "-" + mm + "-" + dd;
                }
                else dEnd = "3000-01-01";

                return DB.dbConn.getHistory(req, filter, dStart, dEnd, freq, res, function (err, req, filter, dStart, dEnd, freq, recordset, res) {
                    var errMsg = "";
                    if (err) errMsg = err.message;
                    if (errMsg != "")
                        res.render('history.ejs', {
                            message: req.flash('plqMessage', errMsg),
                            user : req.user,
                            frequency: freq,
                            items : recordset,
                            filter: filter,
                            dStart: dStart,
                            dEnd: dEnd
                        });
                    else
                        res.render('history.ejs', {
                            message: req.flash('plqMessage'),
                            user : req.user,
                            frequency: freq,
                            items : recordset,
                            filter: filter,
                            dStart: dStart,
                            dEnd: dEnd
                        });
                });
                break;
            default:
                res.render('history.ejs', {
                    message: req.flash('histMessage'),
                    user : req.user,
                    frequency: null,
                    items : null,
                    filter: null,
                    dStart: null,
                    dEnd: null
                });
        }
        
    });
    
    // =====================================
    // OLD PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    //app.get('/profile', isLoggedIn, function (req, res) {
    //    res.render('profile.ejs', {
    //        user : req.user // get the user out of session and pass to template
    //    });
    //});
    
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });


    //\app.get('/', routes.index);
    //\app.get('/users', user.list);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}