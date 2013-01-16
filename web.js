/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , url = require('url')
  , qs = require('querystring')
  , util = require("util")
  , pg = require('pg')
  , async = require('async');

var app = express.createServer(express.logger());

function foreachCB(item, callback) {
  console.log("foreachCB: " + item);
  callback();
}

      async.forEach(["item1", "item2"], foreachCB, function(err){
        console.log("foreach error");
    // if any of the saves produced an error, err would equal that error
      });

      

var dbURL = process.env.DATABASE_URL || 'postgres://localhost:5432/showhear';

var connectionString = process.env.DATABASE_URL || 'postgres://postgres:magnum45@localhost:5432/showhear'
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();

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
  app.use("/images", express.static(__dirname + '/images'));
  app.use("/js", express.static(__dirname + '/js'));
  app.use("/css", express.static(__dirname + '/css'));
  app.use("/jsdatepick-calendar", express.static(__dirname + '/jsdatepick-calendar'));
  app.use("/jsdatepick-calendar/img", express.static(__dirname + '/jsdatepick-calendar/img'));
  app.use("/Scripts", express.static(__dirname + '/Scripts'));
  app.use("/jquery-ui-1.9.2.custom", express.static(__dirname + '/jquery-ui-1.9.2.custom'));
  app.use("/jquerycookie", express.static(__dirname + '/jquerycookie'));

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
   response.render('GigCast.html', {
        myVar: 'My Data'
    });

   // var statsmixClient = new statsmix.Client();
   // statsmixClient.addMetric('Foo metric', fooCounterMetric, { track : true });
});

app.post('/logerror', function(request, response) {
    util.log(request.body.msg);
    response.json({ 'status':"OK"})
});

app.get('/test', function(request, response) {
   //response.send('Hello World!');
   //response.send('Hello World again!');
   // response.render('GigCast.html', {

  query = client.query('SELECT * FROM skid_youtubelink');
    query.on('row', function(row) {
      // console.log(JSON.stringify(row));
      console.log("my url:" + row.youtube_url);
    });
  query.on('end', function() { });

   response.json({ 'testvar':"defaultme", "sqlquery":"none"})
});

function foreachArtistCB(item, artistCallback) {

  query = client.query('SELECT * FROM skid_youtubelink WHERE songkick_id = ' + item.artist.id);
    query.on('row', function(row) {
      // console.log(JSON.stringify(row));
      item.artist.youtubeURL = row.youtube_url;
    });
  query.on('end', function(){artistCallback()});
  //artistCallback();
}

function foreachEventCB(item, eventCallback) {
  // query = client.query('SELECT * FROM skid_youtubelink WHERE ');
  //   query.on('row', function(row) {
  //     // console.log(JSON.stringify(row));
  //     // console.log
  //   });
  // query.on('end', function() {  });

  async.forEach(item.performance, foreachArtistCB, 
    function(err){
      if (err) {
        console.log("error iterating for youtube links: " + err);
      } else {
        // item.testval = "eventTesting!";
        eventCallback();
        // console.log("we have our data!");
      }
// if any of the saves produced an error, err would equal that error
  });

  // console.log(item.displayName);
}

// JSON responses
app.get('/events.json', function(request, response) {
  //response.send('Hello World!');
  //response.send('Hello World again!');
  // response.render('GigCast.html', {

  var http = require('http');
  var options = {
    host: 'api.songkick.com',
    path: '/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=clientip&page=1&min_date=2013-01-15&max_date=2013-01-22'
  };

  http.get(options, function(skres) {
    var data = '';

    // console.log('STATUS: ' + skres.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(skres.headers));
    skres.on('data', function (chunk) {
      // console.log('BODY: ' + chunk);
      // response.write(chunk);
      data += chunk;
    });

    skres.on('end', function (chunk) {
      // console.log('BODY: ' + chunk);
      // data += chunk;
      var songKickdata = JSON.parse(data);


      async.forEach(songKickdata.resultsPage.results.event, foreachEventCB, 
        function(err){
          if (err) {
            console.log("error iterating for youtube links: " + err);
          } else {
            response.json(songKickdata);
            console.log("we have our data!");
          }
    // if any of the saves produced an error, err would equal that error
      });

    //   async.series([
    //       function(callback){
    //           // do some stuff ...

    //           async.forEach(songKickdata.resultsPage.results.event, foreachEventCB, function(err){
    //             console.log("foreach error");
    //         // if any of the saves produced an error, err would equal that error
    //           });

    //           songKickdata.tempitem = "tempval";
    //           callback(null, 'one');
    //       },
    //       function(callback){
    //           // do some more stuff ...
    //           // all of our data has returned
    //           response.json(songKickdata);
    //           callback(null, 'two');
    //       },
    //   ],
    //   // optional callback
    //   function(err, results){
    //     if (err) {
    //       console.log("error iterating for youtube links: " + err);
    //     } else {
    //       console.log("we have our data!");
    //     }
    //   });
    });

    // response.json({ 'testvar':"success"})
  }).on('error', function(e) {
    console.log('ERROR: ' + e.message);
    response.json({ 'testvar':"error"})
  });

  // response.json({ 'testvar':"default"})
});


var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});