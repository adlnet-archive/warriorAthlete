/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    child_process = require('child_process'),
    async = require('async');
var walk = require('fs-walk');
var fs = require('fs-extra');
var path = require('path');

var app = express();
var server = app.listen(3000);


app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').json());
//  app.use(require('method-override'));

function deploy(req, res, next) {
    console.log('hook was hit');

    async.series([

            //first, lets reset the entire git repo
            //currently not  doing this, so local changes on the server will not be 
            //overwritten
            function(cb) {
                child_process.execFile('git', ['reset', '--hard'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    cb();
                })
            },
            //now, we pull new est version of the software
            function(cb) {
                child_process.execFile('git', ['pull'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.status(200)
                    res.write("\r\n### pull ###\r\n");
                    if (e) res.write(JSON.stringify(e) + "\r\n");
                    if (s) res.write(s);
                    if (o) res.write(o);
                    cb();
                })

            },

            //now, lets update this sync server itself and it's dependant modules
            function(cb) {
                child_process.execFile('npm', ['install'], {
                    cwd: __dirname + ''
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.write("\r\n### npm install ###\r\n");
                    if (e) res.write(JSON.stringify(e) + "\r\n");
                    if (s) res.write(s);
                    if (o) res.write(o);
                    cb();
                })

            },

            //check the status and send in the response
            function(cb) {
                child_process.execFile('git', ['status'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.write("\r\n### status ###\r\n");
                    if (e) res.write(JSON.stringify(e) + "\r\n");
                    if (s) res.write(s);
                    if (o) res.write(o);
                    cb();

                })

            },

            //check the log to make sure that the final commit is the right one
            function(cb) {
                child_process.execFile('git', ['log', '-n', '1'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.write("\r\n### last commit ###\r\n");
                    if (e) res.write(JSON.stringify(e) + "\r\n");
                    if (s) res.write(s);
                    if (o) res.write(o);
                    cb();

                })

            },

            //copy the files from the directory to the server's directory
            function(cb) {

                res.write("\r\n### copy files ###\r\n");
                var walkdir = path.resolve(path.join(__dirname + '/../edx'));
                res.write("\r\n### " + walkdir + " ###\r\n");
                walk.walk(walkdir,
                    function(basedir, filename, stat, next) {

                        var fromfile = path.join(basedir, filename);
                        res.write('copy ' + fromfile + "\r\n");
                        var tofile = path.resolve(path.join(basedir, filename));
                        tofile = tofile.substr(walkdir.length);
                        tofile = path.join('/edx/app/edxapp/edx-platform', tofile)
                        res.write('to ' + tofile + "\r\n");
                        fs.copy(fromfile, tofile, function(err) {
                            if (err)
                                res.write(JSON.stringify(err) + "\r\n");
                            next();
                        })

                    },
                    function() {
                        cb()
                    });
            },
            function(cb)
            {
                 child_process.execFile('sudo', ['wa-pull.sh', '-f'], {
                    cwd:  '/warriorAthlete'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    cb();
                })
            }
        ],
        function() {
            console.log(req.body.ref);
            res.end();
            next();
            process.exit();
        });
    //shadlentrixt

}

app.post('/servicehook', deploy);
app.get('/servicehook', deploy);


console.log("Express server listening on port 3000");