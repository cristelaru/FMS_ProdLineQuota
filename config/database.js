var nodemailer = require('nodemailer');
var nconf = require('nconf');

// First consider commandline arguments and environment variables, respectively.
//nconf.argv().env();

// Then load configuration from a designated file.
nconf.file({ file: 'plq.json' });



var sql = require("mssql");

var User = require('../app/models/user');

var dbConfig = {
    server: nconf.get('DBConn:serv'),
    database: nconf.get('DBConn:db'),//"FORMENS",//"ProductionQuota",
    user: nconf.get('DBConn:uname'),
    password: nconf.get('DBConn:pwd')//,
   // port: 1433
};

var objDB = {
    isConnected : Boolean,
//    localError : String
}

objDB.findUser = function (urlreq, username, password, loadUser, done, callback){
    // objDB.isConnected = false;
   // if (err)  throw err;
    //objDB.localError = '';    
      
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
       // objDB.isConnected = true;
        var req = new sql.Request(conexiune);
        var cmd = "SELECT u.[UserCode],u.[Pass],u.[UserName],u.[Email]," + 
                    "(Select AVG(p.Rights) from [dbo].[UserProdLines] p where p.UserCode = u.UserCode) as [isAdmin]" + 
                  " FROM [dbo].[User] u" + 
                  " WHERE u.UserCode = '" + username + "'";
        return req.query(cmd).then(function (recordset) {
            if (recordset.length == 1) {
                if (loadUser) {
                    User.RegUser.local.username = recordset[0].UserCode;
                    User.RegUser.local.password = recordset[0].Pass;
                    User.RegUser.local.name = recordset[0].UserName;
                    User.RegUser.local.email = recordset[0].Email;
                    User.RegUser.local.isAdmin = (recordset[0].isAdmin == 255);

                    conexiune.close();
                    return callback(null, urlreq, password, done);
                }
                else {
                    conexiune.close();
                    return callback(null,urlreq, "", done);
                }
                
               // return done(null, User.RegUser);
            }
            else {

                conexiune.close();
                if (loadUser) {
                   // throw new Error('No such user.');
                    return callback(new Error('No such user.'),urlreq,null,done);
                }
                else {
                    return callback(null,urlreq, " ", done);
                }
              //  return;
               // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
            }
           
        }).catch(function (err) {
            //throw err;
           // console.log(err);
         //   return;
            return callback(err,urlreq,null,done);
        })
        //objDB.localError = 'No such user.';
        //return;
    })
    .catch(function (err) {
        return callback(err,urlreq,null,done);
       // objDB.isConnected = false;
        //objDB.localError = err;
        //console.log(err);
        //return;
    })
   // return this;
 //   objDB.localError = 'Connection to database failed.';
  //  return;
  /*  if (objDB.isConnected) {
        var req = new sql.Request(conexiune);
        var cmd = "SELECT TOP 1 [UserCode],[Pass],[Name],[Email] FROM [dbo].[User]" + 
            " WHERE UserCode = '" + username + "'";
        req.query(cmd).then(function (recordset) {
            if (recordset.length == 1) {
                User.RegUser.local.username = recordset[0].UserCode;
                User.RegUser.local.password = recordset[0].Pass;
                User.RegUser.local.name = recordset[0].Name;
                User.RegUser.local.email = recordset[0].Email;
                return;
               // return done(null, User.RegUser);
            }
            else {
                objDB.localError = 'No such user.';
                return;
               // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
            }
            
        }).catch(function (err) {
            objDB.localError = err;
            console.log(err);
            return;
          //  return done(err);
        })
        objDB.localError = 'No such user.';
        return;
       // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
    }
    else {
        objDB.localError = 'No connection to database.';
        return;
      //  return done(null, false);//, req.flash('loginMessage', 'No connection to database.'))
    }*/
}
objDB.updateUser = function (urlreq, username, newusername, newname, newpassword, newemail, done,callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var cmd = "";// "UPDATE UserCode set ";
        if (newusername != null) cmd += "[UserCode] = '" + newusername + "'";
        if (newpassword != null) {
            if (cmd != "") cmd += ", ";
            cmd += "[Pass] = '" + newpassword + "'";
        }
        if (newname != null) {
            if (cmd != "") cmd += ", ";
            cmd += "[UserName] = '" + newname + "'";
        }
        if (newemail != null) {
            if (cmd != "") cmd += ", ";
            cmd += "[Email] = '" + newemail + "'";
        }
        if (cmd != "") cmd = "UPDATE [dbo].[User] set " + cmd + "WHERE [UserCode] = '" + username + "'";

        return req.query(cmd).then(function (recordset) {
            if (User.RegUser.local.username == username) {
                if (newusername != null) User.RegUser.local.username = newusername;
                if (newpassword != null) User.RegUser.local.password = newpassword;
                if (newname != null) User.RegUser.local.name = newname;
                if (newemail != null) User.RegUser.local.email = newemail;
            }
            conexiune.close();
            return callback(null, urlreq, done);
        }).catch(function (err) {
            conexiune.close();
            return callback(err,urlreq,done);
            //objDB.localError = err;
            //console.log(err);
            //return;
        });
    }).catch(function (err) {
        return callback(err, urlreq, done);
    });
}
objDB.deleteUser = function (urlreq, username, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var cmd = "DELETE FROM [dbo].[UserProdLines] WHERE [UserCode] = '" + username + "';" + 
                  " DELETE FROM [dbo].[User] WHERE [UserCode] = '" + username + "'";
        return req.query(cmd).then(function (recordset) {
            conexiune.close();
            return callback(null, urlreq, done);
        }).catch(function (err) {
            conexiune.close();
            //throw err;
            return callback(err, urlreq, done);
            //objDB.localError = err;
            //console.log(err);
            //return;
        });
    }).catch(function (err) {
        //throw err;
        return callback(err, urlreq, done);
    });
 
}
objDB.insertNewUser = function (urlreq, username, name, password, email, done, callback) {
  //  objDB.localError = '';
  //  if (objDB.isConnected) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var cmd = "INSERT INTO [dbo].[User] ([UserCode],[Pass],[UserName],[Email])" + 
            " values ('" + username + "','" + password + "','" + name + "','" + email + "')";
        return req.query(cmd).then(function (recordset) {
            conexiune.close();
            return callback(null,urlreq,done);
        }).catch(function (err) {
            conexiune.close();
            //throw err;
            return callback(err, urlreq, done);
            //objDB.localError = err;
            //console.log(err);
            //return;
        });
    }).catch(function (err) {
        //throw err;
        return callback(err, urlreq, done);
    });
  //  }
   // else {
   //     objDB.localError = 'No connection to database.';
    //    //return done(null, false, req.flash('loginMessage', 'No connection to database.'))
  //  }
}
objDB.getUsers = function (urlreq, onlyUserCodes, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        // objDB.isConnected = true;
        var req = new sql.Request(conexiune);
        var columns = [];
         var cmd = "SELECT [UserCode]";
        columns.push("UserCode");
        if (!onlyUserCodes) {
            cmd += ", [Pass], [UserName], [Email]";
            columns.push("Pass"); columns.push("UserName"); columns.push("Email");
        }
        cmd += " FROM [dbo].[User] order by [UserCode] ";
        return req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                   conexiune.close();
                   return callback(null, urlreq, columns, recoarde, done);
                }
                else {
                    conexiune.close();
                    return callback(null,urlreq, columns, null, done);
                }
                
               // return done(null, User.RegUser);
               //  return;
               // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
          }).catch(function (err) {
            //throw err;
            // console.log(err);
            //   return;
            return callback(err, urlreq, null, null, done);
        })     
        //objDB.localError = 'No such user.';
        //return;
    }).catch(function (err) {
        //throw err;
        // console.log(err);
        //   return;
        return callback(err, urlreq, null, null, done);
    })
};
objDB.createAdminUser = function (ulrreq, username, res, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        // objDB.isConnected = true;
        var req = new sql.Request(conexiune);
        var cmd = "DELETE FROM dbo.UserProdLines WHERE UserCode = '"+ username + "';" +
                "INSERT INTO dbo.UserProdLines (UserCode,ProdLineCode,Rights) " + 
                "SELECT '"+ username + "',ProdLineCode,255 FROM dbo.ProdLineQuota";
        return req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                connection.close();
                return callback(null,urlreq,res);
            }
            else {
                conexiune.close();
                return callback(new Error("Creating administrator rights failed."),urlreq, res);
            }
                
               // return done(null, User.RegUser);
               //  return;
               // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
        }).catch(function (err) {
            //throw err;
            // console.log(err);
            //   return;
            return callback(err, urlreq, res);
        })
        //objDB.localError = 'No such user.';
        //return;
    }).catch(function (err) {
        //throw err;
        // console.log(err);
        //   return;
        return callback(err, urlreq, res);
    })
}
objDB.revokeAdminUser = function (ulrreq, username, res, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        // objDB.isConnected = true;
        var req = new sql.Request(conexiune);
        var cmd = "DELETE FROM dbo.UserProdLines WHERE UserCode = '" + username + "'"
        return req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                connection.close();
                return callback(null, urlreq, res);
            }
            else {
                conexiune.close();
                return callback(new Error("Creating administrator rights failed."),urlreq, res);
            }
                
               // return done(null, User.RegUser);
               //  return;
               // return done(null, false);//, req.flash('loginMessage', 'No such user.'));
        }).catch(function (err) {
            //throw err;
            // console.log(err);
            //   return;
            return callback(err, urlreq, res);
        })
        //objDB.localError = 'No such user.';
        //return;
    }).catch(function (err) {
        //throw err;
        // console.log(err);
        //   return;
        return callback(err, urlreq, res);
    })
}

objDB.getUserProdLines = function (urlreq, username, filter, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var filterIntern = filter;
        var cmd = "SELECT plq.ProdLineCode,upl.Rights " +
                " FROM dbo.ProdLineQuota plq " +
                " LEFT JOIN (SELECT ProdLineCode, Rights FROM dbo.UserProdLines WHERE UserCode = '" + username + "') upl ON plq.ProdLineCode = upl.ProdLineCode ";
    
        if ((filterIntern != null) && (filterIntern != "")) {
            while (filterIntern.indexOf('*') >= 0) {
                filterIntern = filterIntern.replace('*', '%');
            }
           
           if (filterIntern.indexOf("|") > 0) {
                filterInterns = filterIntern.split('|');
                filterIntern = "";
                for (var i = 0; i<filterInterns.length;i++) {
                    //if (s.indexOf('%') != 0) {
                    //    s = "%" + s;
                    //}
                    //if (s.indexOf('%') != s.length - 1) {
                    //    s += "%";
                    //}
                    if (filterIntern != "")
                        filterIntern = filterIntern + " or plq.ProdLineCode like '" + filterInterns[i] + "'";
                    else
                        filterIntern = "plq.ProdLineCode like '" + filterInterns[i] + "'";
                }
                cmd += " WHERE " + filterIntern + "";
            }
            else {
                // if (filterIntern.indexOf('%') != 0) {
                //    filterIntern = "%" + filterIntern;
                //}
                //if (filterIntern.lastIndexOf('%') != filterIntern.length - 1) {
                //    filterIntern += "%";
                //}
                cmd += " WHERE plq.ProdLineCode like '" + filterIntern + "'";
            }          
            
        }
        cmd += " ORDER BY plq.ProdLineCode";
        //cmd += "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                var req1 = new sql.Request(conexiune);
                cmd = "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
                req1.query(cmd).then(function (recordset1) {
                    if (recordset1.length >= 1) {
                        var users = recordset1;
                        conexiune.close();
                        return callback(null, urlreq, username, filter, recoarde, users, done);
                    }
                    else {
                        conexiune.close();
                        return callback(null, urlreq, username, filter, recoarde, null, done);
                    }
                }).catch(function (err) {
                    conexiune.close();
                    return callback(err, urlreq, null, null, null, null, done);
                });
            }
            else {
                conexiune.close();
                return callback(new Error('User has no production lines attached.'), urlreq, null,null, null, null, done);
            }
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq , null, null, null,null, done);
        })
    }).catch(function (err) {
        return callback(err, urlreq, null, null, null,null, done);
    })
}
//objDB.inserttUserProdLines = function (urlreq, username,prodLineCode,rights, done) {
//    //var conexiune = new sql.Connection(dbConfig);
//    //return conexiune.connect().then(function () {
//    //    var req = new sql.Request(conexiune);
//    //    req.query("SELECT plq.ProdLineCode,upl.Rigths " +
//    //            " FROM dbo.ProdLineQuota plq " +
//    //            " LEFT JOIN (SELECT ProdLineCode, Rigths FROM dbo.UserProdLines WHERE UserCode = '" + username + "') upl ON plq.ProdLineCode = upl.ProdLineCode " +
//    //            " ORDER BY plq.ProdLineCode").then(function (recordset) {
//    //        if (recordset.length >= 1) {
//    //            var recoarde = recordset;
//    //            conexiune.close();
//    //            return callback(null, urlreq, username, recoarde, done);
//    //        }
//    //        else {
//    //            return callback(new Error('User has no production lines attached.'));
//    //        }
            
//    //    }).catch(function (err) {
//    //        return callback(err, urlreq, done);
//    //    })
//    //}).catch(function (err) {
//    //    return callback(err, urlreq, done);
//    //})
//}
objDB.updateUserProdLines = function (urlreq, username, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        for (var key in urlreq.body) {
            if (urlreq.body.hasOwnProperty(key)) {
                var item = urlreq.body[key];
                var idxOf = item.indexOf("lbl_");
                if (idxOf == 0) {
                    var plCode = item.substr(4);
                    var rights = 0;
                    
                    if (urlreq.body[plCode + "`~`0"] !== undefined) rights += 1;
                    if (urlreq.body[plCode + "`~`1"] !== undefined) rights += 2;
                    if (urlreq.body[plCode + "`~`2"] !== undefined) rights += 4;
                    
                    var cmd = "if exists(select Rights from dbo.UserProdLines where UserCode = '" + username + "' and ProdLineCode = '" + plCode + "') " +
                              "  update dbo.UserProdLines set Rights = " + rights.toString() + " where UserCode = '" + username + "' and ProdLineCode = '" + plCode + "' and Rights <> 255" + 
                              " else insert into dbo.UserProdLines(UserCode,ProdLineCode,Rights) values ('" + username + "','" + plCode + "'," + rights.toString() + ")";
                    req.query(cmd).then(function (recordset) {
                        //if (recordset.length >= 1) {
                        //    //nu fac nimic, tat normal
                        //}
                        //else {
                        //    conexiune.close();
                        //    return callback(new Error('Attaching rights failed.'));
                        //}
            
                    }).catch(function (err) {
                        conexiune.close();
                        return callback(err, urlreq, done);
                    });
                }
            }
        }
        var nmc = 0;
        conexiune.close();
        return callback(null, urlreq, done);
    }).catch(function (err) {
        return callback(err, urlreq, done);
    })
}
//objDB.deleteUserProdLines = function (req, username, prodLineCode, done) {
//    if (objDB.isConnected) {

//    }
//    else {
//        return done(null, false, req.flash('loginMessage', 'No connection to database.'))
//    }
//}

objDB.updateQuota = function (urlreq, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        for (var key in urlreq.body) {
            if (urlreq.body.hasOwnProperty(key)) {
                var item = urlreq.body[key];
                var idxOf = item.indexOf("lbl_");
                if (idxOf == 0) {
                    var plCode = item.substr(4);
                    var quota = urlreq.body[plCode + "`~`Quota"];
                    
                    var cmd = "update dbo.ProdLineQuota set Quota = " + quota.toString() + 
                              ", LastModified = GETDATE(), UserCode = '" + User.RegUser.local.username + "' where ProdLineCode = '" + plCode + "' and Quota <> " + quota.toString();
                    req.query(cmd).then(function (recordset) {
                        if (recordset.length >= 1) {
                            //nu fac nimic, tat normal
                        }
                        else {
                            conexiune.close();
                            return callback(new Error('Modifying quota for Production Line "' + plCode + '" failed.'), urlreq, done);
                        }
            
                    }).catch(function (err) {
                        conexiune.close();
                        return callback(err, urlreq, done);
                    });
                }
            }
        }
        var nmc = 0;
        conexiune.close();
        return callback(null, urlreq, done);
    }).catch(function (err) {
        return callback(err, urlreq, done);
    })
}
objDB.getQuotas = function (urlreq, filter, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var filterIntern = filter;
        var cmd = "SELECT plq.ProdLineCode, plq.Quota," +
                      " right('00' + cast(datepart(DD,plq.LastModified) as varchar(2)),2) + '/' +" + 
                      " right('00' + cast(datepart(MM,plq.LastModified) as varchar(2)),2) + '/' +" + 
                      " cast(datepart(YYYY,plq.LastModified) as varchar(4)) +" +
                      " ' ' + right('00' + cast(datepart(HH, plq.LastModified)as varchar(2)), 2) +" +
                      " ':' + right('00' + cast(datepart(minute, plq.LastModified) as varchar(2)),2) +" +
                      "':' + right('00' + cast(datepart(ss, plq.LastModified)as varchar(2)), 2) as LastModified, plq.UserCode" +
                 " FROM (select ProdLineCode from dbo.UserProdLines where UserCode = '" + User.RegUser.local.username + "' and (Rights & 2) <> 0) flt" +
                 " left join dbo.ProdLineQuota plq" +
                 " on flt.ProdLineCode = plq.ProdLineCode ";
        
        if ((filterIntern != null) && (filterIntern != "")) {
            while (filterIntern.indexOf('*') >= 0) {
                filterIntern = filterIntern.replace('*', '%');
            }
            
            if (filterIntern.indexOf("|") > 0) {
                filterInterns = filterIntern.split('|');
                filterIntern = "";
                for (var i = 0; i < filterInterns.length; i++) {
                    //if (s.indexOf('%') != 0) {
                    //    s = "%" + s;
                    //}
                    //if (s.indexOf('%') != s.length - 1) {
                    //    s += "%";
                    //}
                    if (filterIntern != "")
                        filterIntern = filterIntern + " or upper(plq.ProdLineCode) like upper('" + filterInterns[i] + "')";
                    else
                        filterIntern = "upper(plq.ProdLineCode) like upper('" + filterInterns[i] + "')";
                }
                cmd += " WHERE " + filterIntern + "";
            }
            else {
                // if (filterIntern.indexOf('%') != 0) {
                //    filterIntern = "%" + filterIntern;
                //}
                //if (filterIntern.lastIndexOf('%') != filterIntern.length - 1) {
                //    filterIntern += "%";
                //}
                cmd += " WHERE upper(plq.ProdLineCode) like upper('" + filterIntern + "')";
            }
            
        }
        cmd += " ORDER BY ProdLineCode";
        //cmd += "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                conexiune.close();
                return callback(null, urlreq, filter, recoarde, done);                
            }
            else {
                conexiune.close();
                return callback(null, urlreq, filter, null, done);
            }
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq,null,null, done);
        })
    }).catch(function (err) {
        return callback(err, urlreq,null,null, done);
    })
}

objDB.getPLFromFMS = function (urlreq, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var cmd = "insert into [ProductionQuota].[dbo].[ProdLineQuota] (ProdLineCode,Quota,LastModified)" +
                  " select fms.code, 1.0, GETDATE() from [FORMENS].[dbo].[SC FORMENS SRL$PfsProduction Line] fms" +
                  " left join [ProductionQuota].[dbo].[ProdLineQuota] pq on fms.Code = pq.ProdLineCode" +
                  " where pq.ProdLineCode is null";
        req.query(cmd).then(function (recordset) {
            //if ((recordset !== undefined) && (recordset.length >= 1)) {
                conexiune.close();
                return callback(null, urlreq, done);
            //}
            //else {
            //    conexiune.close();
            //    return callback(null, urlreq, done);
            //}            
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq, done);
        });        
    }).catch(function (err) {
        return callback(err, urlreq, done);
    })
};
objDB.updateSettings = function (urlreq, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        for (var key in urlreq.body) {
            if (urlreq.body.hasOwnProperty(key)) {
                var item = urlreq.body[key];
                var idxOf = item.indexOf("lbl_");
                if (idxOf == 0) {
                    var settingCode = item.substr(4);
                    var value = urlreq.body[settingCode + "`~`Value"];
                    
                    var cmd = "update dbo.Settings set Value = '" + value + "'" +
                              " where SettingCode = '" + settingCode + "'";
                    req.query(cmd).then(function (recordset) {
                        if (recordset.length >= 1) {
                            //nu fac nimic, tat normal
                        }
                        else {
                            conexiune.close();
                            return callback(new Error('Modifying value for Setting "' + settingCode + '" failed.'), urlreq, done);
                        }
            
                    }).catch(function (err) {
                        conexiune.close();
                        return callback(err, urlreq, done);
                    });
                }
            }
        }       
        conexiune.close();
        return callback(null, urlreq, done);
    }).catch(function (err) {
        return callback(err, urlreq, done);
    })
}
objDB.getSettings = function (urlreq, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
       // var filterIntern = filter;
        var cmd = "SELECT SettingCode, Value" +
                   " FROM dbo.Settings ORDER BY SettingCode ";        
       
        //cmd += "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                conexiune.close();
                return callback(null, urlreq, recoarde, done);
            }
            else {
                conexiune.close();
                return callback(null, urlreq,  null, done);
            }
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq, null, done);
        })
    }).catch(function (err) {
        return callback(err, urlreq, null, done);
    })
}

objDB.getQuotaOfProdLines = function (urlreq, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        // var filterIntern = filter;
        var cmd = "select upl.ProdLineCode,plq.Quota" +
                  " from(select * from UserProdLines where usercode = '" + User.RegUser.local.username + "') upl left join ProdLineQuota plq on upl.ProdLineCode = plq.ProdLineCode" +
                  " where(upl.Rights & 4 > 0)";
        
        //cmd += "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                conexiune.close();
                return callback(null, urlreq, recoarde, done);
            }
            else {
                conexiune.close();
                return callback(null, urlreq, null, done);
            }
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq, null, done);
        })
    }).catch(function (err) {
        return callback(err, urlreq, null, done);
    })
}
objDB.updateProduced = function (urlreq, done, callback){
    var conexiune = new sql.Connection(dbConfig);
    var dates = "";
    var prodLines = "";
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        for (var key in urlreq.body) {
            if (urlreq.body.hasOwnProperty(key)) {
                var item = urlreq.body[key];
                var idxOf = item.indexOf("lbl_");
                if (idxOf == 0) {
                    var prodLineCode = item.substr(4);
                    var quota = urlreq.body[prodLineCode + "`~`Quota"];
                    var produced = urlreq.body[prodLineCode + "`~`Produced"];
                    var persPrez = urlreq.body[prodLineCode + "`~`WPresent"];
                    var persTotal = urlreq.body[prodLineCode + "`~`WTotal"];
                    var input = urlreq.body[prodLineCode + "`~`Input"];                    
                    
                    if (urlreq.body[prodLineCode + "`~`Data"] != "") {//data valida
                        var data = new Date(urlreq.body[prodLineCode + "`~`Data"]);
                        var dd = data.getDate();
                        var mm = data.getMonth() + 1; //January is 0!
                        var yyyy = data.getFullYear();
                    
                        if (dd < 10) dd = '0' + dd;
                        if (mm < 10) mm = '0' + mm;
                    
                        var stringData = yyyy + "-" + mm + "-" + dd;
                        if (dates.indexOf(stringData) < 0) {
                            if (dates == "") dates = "'" + stringData + "'"
                            else dates += ",'" + stringData + "'";
                        }
                        if (prodLines.indexOf(prodLineCode) < 0) {
                            if (prodLines == "") prodLines = "'" + prodLineCode + "'"
                            else prodLines += ",'" + prodLineCode + "'";
                        }
                      

                        var cmd = "if exists(select top 1 [ProdLineCode],[DataRegistered]" + 
                                " from [dbo].[Produced] where [ProdLineCode] = '" + prodLineCode + "' and [DataRegistered] = '" + stringData + "')" +
                              " update [dbo].[Produced] set [UserCode] = '" + User.RegUser.local.username + "', Quota = " + quota.toString() + 
                                        ", Produced = " + produced.toString() + ", PersonalPrezent = " + persPrez.toString() + 
                                        ", PersonalTotal = " + persTotal.toString() + 
                                        ", Input = " + input.toString() +
                                        " where [ProdLineCode] = '" + prodLineCode + "' and [DataRegistered] = '" + stringData + "'" +
                              " else" + 
                              " insert into [dbo].[Produced] ([UserCode],[ProdLineCode],[DataRegistered],[Quota],[Produced],[PersonalPrezent],[PersonalTotal],[Input])" +
                              " values ('" + User.RegUser.local.username + "','" + prodLineCode + "','" + stringData + "'," + quota.toString() + 
                                        "," + produced.toString() + "," + persPrez.toString() + "," + persTotal.toString() + "," + input.toString() + ")";
                        req.query(cmd).then(function (recordset) {
                            //if (recordset.length >= 1) {
                            //}
                            //else {
                            //    conexiune.close();
                            //    return callback(new Error('Modifying produced for Production Line "' + prodLineCode + '" failed.'));
                            //}            
                        }).catch(function (err) {
                            conexiune.close();
                            return callback(err, urlreq,null, null, done);
                        });
                    }
                    
                }
            }
        }
        conexiune.close();
        return callback(null, urlreq, dates, prodLines, done);       
    }).catch(function (err) {
        return callback(err, urlreq, null, null, done);
    })
}

objDB.sendEmail = function (urlreq, dates, prodLines, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        
        var cmd = "select [UserCode], [ProdLineCode], [DataRegistered], [Input], [Quota], [Produced], [PersonalPrezent], [PersonalTotal], [Input]" +
                 " from Produced where UserCode = '" + User.RegUser.local.username + "' and ProdLineCode in (" + prodLines + ") and DataRegistered in (" + dates + ")";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var req1 = new sql.Request(conexiune);
                var cmd1 = "select SettingCode,[Value] from Settings where SettingCode IN ('Management E-mail address','E-mail header','E-mail footer')";
                req1.query(cmd1).then(function (recordset1) {
                    if (recordset1.length >= 1) {
                        var eMailAddr = "";
                        var eMailHeader = "";
                        var eMailFooter = "";
                        
                        for (var i = 0; i < recordset1.length; i++) {
                            switch (recordset1[i]['SettingCode']) {
                                case "Management E-mail address":
                                    eMailAddr = recordset1[i]['Value'];
                                    break;
                                case "E-mail header":
                                    eMailHeader = recordset1[i]['Value'];
                                    break;
                                case "E-mail footer":
                                    eMailFooter = recordset1[i]['Value'];
                                    break;
                            }
                        }
                        
                        conexiune.close();
                        
                        if (eMailAddr != "") {
                            var transporter = nodemailer.createTransport({
                                //service: 'Gmail',
                                //auth: {
                                //    user: 'example@gmail.com', // Your email id
                                //    pass: 'password' // Your password
                                //}
                                
                                host: nconf.get('Email:serv'),
                                port: nconf.get('Email:port'),
                                secure: false, // use SSL
                                //ignoreTLS : true,
                                tls: {
                                    rejectUnauthorized: false
                                },
                                auth: {
                                    user: nconf.get('Email:uname'),
                                    pass: nconf.get('Email:pwd')
                                },
                                authMethod: nconf.get('Email:authMet')
                            });
                            // transporter.verify(function (error, success) {
                            //    if (error) {
                            //        console.log(error);
                            //    } else {
                            var htmBody = '<div align="left">Production line closing day(s) from ' + User.RegUser.local.name + '</div>';
                            htmBody += '<div align="center"><table border="1">';
                            htmBody += '<b><tr>';
                            //htmBody += '<td>User Code</td>';
                            htmBody += '<td>Production Line</td>';
                            htmBody += '<td>Closing Date</td>';
                            htmBody += '<td>In</td>';
                            htmBody += '<td>Produced</td>';
                            htmBody += '<td>To Produce<br>(Quota)</td>';
                            htmBody += '<td>Produced %</td>';
                            htmBody += '<td>Present<br>Workers</td>';
                            htmBody += '<td>Total<br>Workers</td>';
                            htmBody += '<td>Present<br>Workers %</td>';
                            htmBody += '<td>Productivity</td>';
                            htmBody += '</tr></b>';
                            var dataCr,dd,mm,yyyy,stringData;
                            for (var i = 0; i < recordset.length; i++) {
                                dataCr = new Date(recordset[i]['DataRegistered']);
                                dd = dataCr.getDate();
                                mm = dataCr.getMonth() + 1; //January is 0!
                                yyyy = dataCr.getFullYear();
                                
                                if (dd < 10) dd = '0' + dd;
                                if (mm < 10) mm = '0' + mm;
                                
                                stringData = dd + "/" +  mm + "/" + yyyy;

                                htmBody += '<tr>'                                   
                                //htmBody += '<td>' + recordset[i]['UserCode'] + '</td>';
                                htmBody += '<td>' + recordset[i]['ProdLineCode'] + '</td>';
                                htmBody += '<td>' + stringData + '</td>';
                                htmBody += '<td>' + recordset[i]['Input'].toString() + '</td>';
                                htmBody += '<td>' + recordset[i]['Quota'].toString() + '</td>';
                                htmBody += '<td>' + recordset[i]['Produced'].toString() + '</td>';
                                htmBody += '<td>' + (100.0 * recordset[i]['Produced'] / recordset[i]['Quota']).toFixed(2) + '</td>';
                                htmBody += '<td>' + recordset[i]['PersonalPrezent'].toString() + '</td>';
                                htmBody += '<td>' + recordset[i]['PersonalTotal'].toString() + '</td>';
                                htmBody += '<td>' + (100.0 * recordset[i]['PersonalPrezent'] / recordset[i]['PersonalTotal']).toFixed(2) + '</td>';
                                htmBody += '<td>' + (recordset[i]['PersonalPrezent'] / recordset[i]['Produced']).toFixed(2) + '</td>';
                                htmBody += '</tr>'
                            }
                            htmBody += '</table></div><br><br>';
                            htmBody += eMailFooter.replace('%1', '<br>&#09' + User.RegUser.local.name);


                            var mailOptions = {
                                from: User.RegUser.local.email,//'cristelaru@gmail.com', // sender address
                                to: eMailAddr, // list of receivers'cristi.vitelaru@formens.ro'
                                subject: 'Production Closing day registered by ' + User.RegUser.local.name, // Subject line
                                // text: text //, // plaintext body
                                html: htmBody // You can choose to send an HTML body instead
                            };
                            return transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return callback(error, urlreq, done);
                                } else {
                                    return callback(null, urlreq, done);
                                };
                            });
                             //   }
                           // });
                            
                        }
                        else {
                            return callback(new Error('Could not send e-mail (No receiver defined).'), urlreq, res);
                        }
                       
                    }
                    else {
                        conexiune.close();
                        return callback(new Error('Could not send e-mail (No settings defined).'),urlreq,res);
                    }            
                }).catch(function (err) {
                    conexiune.close();
                    return callback(err, urlreq, done);
                });                
            }
            else {
                conexiune.close();
                return callback(new Error('Could not send e-mail (Nothing to send).'), urlreq, res);
            }           
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq, done);
        });
    }).catch(function (err) {
        return callback(err, urlreq, done);
    })

};

objDB.getHistory = function (urlreq, filter, dStart, dEnd, freq, done, callback) {
    var conexiune = new sql.Connection(dbConfig);
    return conexiune.connect().then(function () {
        var req = new sql.Request(conexiune);
        var filterIntern = filter; //100.0 * p.[Produced]/p.[Quota]
        var cmd = "select <UserCode> p.[ProdLineCode], <DataRegistered> as DataRegistered, <Input> as [Input]," +
                    " <Quota> as Quota, <Produced> as Produced, cast(100.0 * <Produced>/<Quota> as decimal(18,2)) as ProcProd," +
                    " <PersonalPrezent> as PersonalPrezent, <PersonalTotal> as PersonalTotal," +
                    " cast(100.0 * <PersonalPrezent>/<PersonalTotal> as decimal(18,2)) as ProcWorkers, " +
                    " case <PersonalPrezent> when 0 then null else cast(<Produced>/<PersonalPrezent> as decimal(18,2)) end as Productivity" +
                 " FROM (select ProdLineCode from dbo.UserProdLines where UserCode = '" + User.RegUser.local.username + "' and (Rights & 1) <> 0) flt" +
                 " inner join dbo.Produced p" +
                 " on flt.ProdLineCode = p.ProdLineCode ";
        
        if ((filterIntern != null) && (filterIntern != "")) {
            while (filterIntern.indexOf('*') >= 0) {
                filterIntern = filterIntern.replace('*', '%');
            }
            
            if (filterIntern.indexOf("|") > 0) {
                filterInterns = filterIntern.split('|');
                filterIntern = "";
                for (var i = 0; i < filterInterns.length; i++) {
                    //if (s.indexOf('%') != 0) {
                    //    s = "%" + s;
                    //}
                    //if (s.indexOf('%') != s.length - 1) {
                    //    s += "%";
                    //}
                    if (filterIntern != "")
                        filterIntern = filterIntern + " or upper(p.ProdLineCode) like upper('" + filterInterns[i] + "')";
                    else
                        filterIntern = "upper(p.ProdLineCode) like upper('" + filterInterns[i] + "')";
                }
                cmd += " WHERE " + filterIntern + "";
            }
            else {
                // if (filterIntern.indexOf('%') != 0) {
                //    filterIntern = "%" + filterIntern;
                //}
                //if (filterIntern.lastIndexOf('%') != filterIntern.length - 1) {
                //    filterIntern += "%";
                //}
                cmd += " WHERE p.ProdLineCode like '" + filterIntern + "'";
            }
            
        }
        
        if ((dStart != null) && (dStart != "")) {
            if ((filterIntern != null) && (filterIntern != "")) {
                cmd += " and p.[DataRegistered] >= '" + dStart + "'"
            }
            else {
                cmd += " WHERE p.[DataRegistered] >= '" + dStart + "'"
            }               
        }
        
        if ((dEnd != null) && (dEnd != "")) {
            if (((filterIntern != null) && (filterIntern != "")) || ((dStart != null) && (dStart != ""))) {
                cmd += " and p.[DataRegistered] <= '" + dEnd + "'"
            }
            else {
                cmd += " WHERE p.[DataRegistered] <= '" + dEnd + "'"
            }
        }

         if ((freq == null) || (freq == "")) { freq = "Day"; }
       
        if (freq != "Day" ) cmd += " GROUP BY <UserCode> p.[ProdLineCode], <DataRegistered>"; 
        cmd +=  " ORDER BY <UserCode> p.[ProdLineCode], <DataRegistered>";
        
        var replaceUserCode = "";
        var replaceInput = "p.Input";
        var replaceDReg = "";
        var replaceQota = "SUM(p.Quota)";
        var replaceProduced = "SUM(p.Produced)";
        var replaceTotW = "AVG(p.PersonalTotal)";
        var replacePrezW = "AVG(p.PersonalPrezent)";
       // var replaceAvgProduced = "AVG(p.Produced/p.PersonalPrezent)";
   
        switch (freq) {
            //case "Day":
            //    break;
            case "Week":
                replaceDReg = "cast(datepart(yyyy,(p.DataRegistered + 7-datepart(weekday,p.DataRegistered) - 5)) as varchar(4)) + '/' + " +
                " right('0' + cast(datepart(MM, (p.DataRegistered + 7 - datepart(weekday, p.DataRegistered) - 5))as varchar(2)), 2) + '/' + " +
                " right('0' + cast(datepart(DD, (p.DataRegistered + 7 - datepart(weekday, p.DataRegistered) - 5))as varchar(2)), 2) +" +
                " ' - ' +" +
                " cast(datepart(yyyy,(p.DataRegistered + 7-datepart(weekday, p.DataRegistered)- 5 + 6)) as varchar(4)) + '/' + " +
                " right('0'+ cast(datepart(MM,(p.DataRegistered + 7-datepart(weekday,p.DataRegistered) - 5 + 6)) as varchar(2)),2) + '/' + " +
                " right('0'+ cast(datepart(DD,(p.DataRegistered + 7-datepart(weekday, p.DataRegistered) - 5 + 6)) as varchar(2)),2)";
                break;             
            case "Month":
                replaceDReg = "cast(datepart(yyyy,p.DataRegistered) as varchar(4)) + '/' + right('0'+ cast(datepart(MM,p.DataRegistered) as varchar(2)),2)";
                break;
            case "Year":
                replaceDReg = "cast(datepart(yyyy,p.DataRegistered) as varchar(4))";
                break;
            default://Day or other 
                // if (freq == "Day"){
                replaceDReg = "cast(datepart(yyyy,p.DataRegistered) as varchar(4)) + '/' + right('0'+ cast(datepart(MM,p.DataRegistered) as varchar(2)),2) + '/' + right('0'+ cast(datepart(DD,p.DataRegistered) as varchar(2)),2)";
                replaceUserCode = "p.UserCode,";
                replaceQota = "p.Quota";
                replaceProduced = "p.Produced";
                replaceTotW = "p.PersonalTotal";
                replacePrezW = "p.PersonalPrezent";
                // replaceAvgProduced = "p.Produced/p.PersonalPrezent";
       // }
       }

        while (cmd.indexOf("<UserCode>") >= 0) {
            cmd = cmd.replace("<UserCode>", replaceUserCode);
        }
        while (cmd.indexOf("<DataRegistered>") >= 0) {
            cmd = cmd.replace("<DataRegistered>", replaceDReg);
        }
        while (cmd.indexOf("<Input>") >= 0) {
            cmd = cmd.replace("<Input>", replaceQota);
        }
        while (cmd.indexOf("<Quota>") >= 0) {
            cmd = cmd.replace("<Quota>", replaceQota);
        }
        while (cmd.indexOf("<Produced>") >= 0) {
            cmd = cmd.replace("<Produced>", replaceProduced);
        }
        while (cmd.indexOf("<PersonalTotal>") >= 0) {
            cmd = cmd.replace("<PersonalTotal>", replaceTotW);
        }
        while (cmd.indexOf("<PersonalPrezent>") >= 0) {
            cmd = cmd.replace("<PersonalPrezent>", replacePrezW);
        }
       // while (cmd.indexOf("<AvgProduced>") >= 0) {
       //     cmd = cmd.replace("<AvgProduced>", replaceAvgProduced);
       // }    


         //cmd += "SELECT UserCode FROM [dbo].[User] ORDER BY UserCode";
        req.query(cmd).then(function (recordset) {
            if (recordset.length >= 1) {
                var recoarde = recordset;
                conexiune.close();
                return callback(null, urlreq, filter, dStart, dEnd, freq, recoarde, done);
            }
            else {
                conexiune.close();
                return callback(null, urlreq, filter, dStart, dEnd, freq, null, done);
            }
        }).catch(function (err) {
            conexiune.close();
            return callback(err, urlreq, null, null, null, null, null,  done);
        })
    }).catch(function (err) {
        return callback(err, urlreq, null, null, null,null, null, done);
    })
}

module.exports = { 'dbConn' : objDB };