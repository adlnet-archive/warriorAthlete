/**
 * Module dependencies.
 */
var express = require('express'),
  http = require('http'),
  child_process = require('child_process');

var app = express();
var server = app.listen(3000);


app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').json());
//  app.use(require('method-override'));
app.post('/servicehook', function(req, res, next) {
  console.log('hook was hit');
  res.status(200).end();

  

  child_process.execFile('git', ['reset','--hard'],{cwd:__dirname + '/../'}, function(e,s,o) {
     console.log(e);
    console.log(s);
    console.log(o);
    child_process.execFile('git', ['pull'],{cwd:__dirname + '/../'}, function(e,s,o) {
      console.log(e);
      console.log(s);
      console.log(o);



  

//shadlentrixt



console.log(req.body.ref);

      process.exit();
    })
  })
  next();
});


console.log("Express server listening on port 3000");