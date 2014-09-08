var Connection = require('ssh2');
var async = require('async');
var fs = require('fs');
var guid = require('node-uuid').v1;


var cert = fs.readFileSync('edx.pem');
var stage = new Connection();
var release = new Connection();

var downloadFromStage = function(cb2) {
    console.log('connected to stage');
    stage.sftp(function(err, sftp) {
        if (err) throw err;

        async.series([

            function(cb) {
                stage.exec('sudo su; cd /edx/app/edxapp/edx-platform; sudo  /edx/bin/python.edxapp ./manage.py cms --settings aws export ADL/WA_101/2014_T1  /course.tar.gz', function() {
                    console.log('exported');
                    global.setTimeout(function() {

                        cb();
                    }, 10000)

                });
            },
            function(cb) {
                stage.exec('cd /; sudo chmod 777 -R /course.tar;sudo tar -zcvf course.tar.gz /course.tar', function(err) {
                    console.log(err);
                    console.log('perms changed');
                    global.setTimeout(function() {

                        cb();
                    }, 3000)
                });
            },
            function(cb) {
                console.log('fetching course from server');
                sftp.fastGet('/course.tar.gz', './course.tar.gz', function(err) {
                    console.log(err);
                    if (!err) {
                        console.log('download complete')
                        cb();
                    }
                })
            }
        ], function(err) {
            stage.end();
            cb2(); //finish the download stage, go to next. Should go to connectToRelease
        })
    });
}

function uploadToRelease() {
    console.log('connected to release');
    release.sftp(function(err, sftp) {

        if (err) throw err;

        async.series([

            function(cb) {
                console.log('uploading course to server');
                sftp.fastPut('./course.tar.gz', '/upload/course.tar.gz', function(err) {
                    console.log(err);
                    console.log('upload complete')
                    cb();
                })
            },
            function(cb) {
                console.log('extracting course');
                release.exec('cd /upload; sudo tar -zxvf course.tar.gz', function(err) {
                    console.log(err);
                    cb();
                });
            },
            function(cb) {
                console.log('importing  course');
                release.exec('sudo su; cd /edx/app/edxapp/edx-platform; sudo  /edx/bin/python.edxapp ./manage.py cms --settings aws import /edx/var/edxapp/data /upload/course.tar', function() {
                    cb();
                });
            }

        ], function(err) {

            console.log('done');
            release.end();
        })
    });
}

function connectToRelease() {
    release.connect({
        host: 'ec2-54-85-28-165.compute-1.amazonaws.com',
        port: 22,
        username: 'ubuntu',
        privateKey: cert,
        passphrase: "$c0rmR0ck$",
        readyTimeout: 99999
    });

    release.on('ready', uploadToRelease);
    release.on('connect', function() {
        console.log('Connection :: connect to release');
    });
}

stage.connect({
    host: 'ec2-54-164-229-132.compute-1.amazonaws.com',
    port: 22,
    username: 'ubuntu',
    privateKey: cert,
    passphrase: "$c0rmR0ck$",
    readyTimeout: 99999
});
stage.on('ready', function() {
    downloadFromStage(connectToRelease);
});
stage.on('connect', function() {
    console.log('Connection :: connect to stage');
});