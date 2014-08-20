/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    child_process = require('child_process'),
    async = require('async');

var app = express();
var server = app.listen(3000);


app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').json());
//  app.use(require('method-override'));

function deploy(req, res, next) {
    console.log('hook was hit');

    async.series([

            //first, lets reset the entire git repo
            /*      function(cb) {
                child_process.execFile('git', ['reset', '--hard'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    cb();
                })
            },*/
            //now, 
            function(cb) {
                child_process.execFile('git', ['pull'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.status(200).write(s);
                    cb();
                })

            },


            //now,  
            function(cb) {
                child_process.execFile('npm', ['install'], {
                    cwd: __dirname + ''
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.write(s);
                    cb();
                })

            },

            function(cb) {
                child_process.execFile('git', ['status'], {
                    cwd: __dirname + '/../'
                }, function(e, s, o) {
                    console.log(e);
                    console.log(s);
                    console.log(o);
                    res.write(s);
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