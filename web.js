// var express = require('express');

// var app = express.createServer(express.logger());

// app.register('.html', require('jade'));

// app.get('/', function(request, response) {
//   response.send('Hello World!');
//   //response.render('foo.html');
// });

// var port = process.env.PORT || 5000;
// app.listen(port, function() {
//   console.log("Listening on " + port);
// });



/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express.createServer(express.logger());

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jshtml');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.use("/Styles", express.static(__dirname + '/Styles'));
  app.use("/js", express.static(__dirname + '/js'));
  app.use("/css", express.static(__dirname + '/css'));
  app.use("/jsdatepick-calendar", express.static(__dirname + '/jsdatepick-calendar'));
  app.use("/jsdatepick-calendar/img", express.static(__dirname + '/jsdatepick-calendar/img'));
  app.use("/Scripts", express.static(__dirname + '/Scripts'));
  app.use("/jquery-ui-1.9.2.custom", express.static(__dirname + '/jquery-ui-1.9.2.custom'));

  // disable layout
  app.set("view options", {layout: false});

  // make a custom html template
  app.register('.html', {
    compile: function(str, options){
      return function(locals){
        return str;
      };
    }
  });

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.get('/', routes.index);
// app.get('/users', user.list);

app.get('/', function(request, response) {
   //response.send('Hello World!');
   //response.send('Hello World again!');
   response.render('GigCast.html');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

// http.createServer(app).listen(app.get('port'), function(){
//   console.log("Express server listening on port " + app.get('port'));
// });
