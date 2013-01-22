/**
 * Module dependencies.
 */
var youtubeDeveloperKey = "AI39si4Vw4awrAAg8ezG3zeJVrW7nELo6T4S8CRe6Vd47CsA9uY_rrUmifm98_CDJM4fCCGnNafqg_Mx0IukXIvZIvMJMkzPmQ";

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , url = require('url')
  , qs = require('querystring')
  , util = require("util")
  // , pg = require('pg')
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

// var connectionString = process.env.DATABASE_URL || 'postgres://postgres:magnum45@localhost:5432/showhear'
//   , client
//   , query;

// client = new pg.Client(connectionString);
// client.connect();

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

  // app.enable("jsonp callback");

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

// TODO TESTING GOOGLE API

// TODO testing nodejs-youtube

// load the module
var youtube = require('youtube-feeds');

// search parkour videos
// youtube.feeds.videos( {q: 'parkour'}, console.log );

app.get('/ytfeeds', function(req, res) {
    // gdataClient.getFeed('https://www.google.com/m8/feeds/contacts/default/full', {'max-results':3},
    // function(err, feed) {
    //     res.writeHead(200);
    //     for(var i in feed.feed.entry) {
    //         res.write(JSON.stringify(feed.feed.entry[i].title));
    //         res.write(JSON.stringify(feed.feed.entry[i].gd$email));
    //         res.write('\n\n');
    //     }
    //     res.end();
    // });

  youtube.feeds.videos( {q: 'parkour'}, function( err, data ) {
    if( err instanceof Error ) {
        console.log( "youtube feed error: " + err );
    } else {
        // console.log( data );
        res.json(data);
    }
  });
});

// TODO ENDING GOOGLE TESTING

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
    console.log("here= ", request.query["heref"]);

   response.json({ 'testvar':"defaultme", "sqlquery":"none"})
});

function foreachArtistCB(item, artistCallback) {

  // query = client.query('SELECT * FROM skid_youtubelink WHERE songkick_id = ' + item.artist.id);
  //   query.on('row', function(row) {
  //     // console.log(JSON.stringify(row));
  //     // TODO this doesn't handle multiple return values
  //     item.artist.youtubeURL = row.youtube_url;
  //   });
  // query.on('end', function(){
  //   if (item.artist.youtubeURL) {
  //     artistCallback();
  //   } else
    {

    // TODO we will want to store at least some of these locally before sending off
    // Also need to figure out the perf impact here, it may be fairly dramatic

      youtube.feeds.videos( {
                              q: item.artist.displayName,
                              category: "Music",
                              key: youtubeDeveloperKey
                            }
                          , function( err, data ) {
        if( err instanceof Error ) {
            console.log( "youtube feed error for "+item.artist.displayName+":" + err );
            artistCallback();
        } else {
            // console.log( data );
            // res.json(data);
            item.artist.youtubeID = data.items[0].id;
            item.artist.youtubeURL = data.items[0].player.default;
            artistCallback();
        }
      });

    }
    
  // });
  //artistCallback();
}

function foreachEventCB(item, eventCallback) {
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

  // var http = require('http');

  console.log("CLIENT IP IS: " + request.connection.remoteAddress);

  if(!request.query["min_date"]) {
    console.log("min_date required");
    response.json({status:"error", message:"min_date required"});
    return;
  }

  if(!request.query["max_date"]) {
    console.log("max_date required");
    response.json({status:"error", message:"max_date required"});
    return;
  }

  if(!request.query["page"]) {
    console.log("page required");
    response.json({status:"error", message:"page required"});
    return;
  }

  // TODO what location info does client pass in and how do we parse?
  if(!request.query["location"]) {
    console.log("location required");
    response.json({status:"error", message:"location required"});
    return;
  }

  var queryStringParameterse = {
    apikey: "bUMFhmMfaIpxiUgJ",
    min_date: request.query["min_date"],
    max_date: request.query["max_date"],
    page: request.query["page"],
    location: request.query["location"]
  }

  if (queryStringParameterse.location == "clientip") {
    // better way to test for our own host?
    if (request.connection.remoteAddress == "127.0.0.1") {
      console.log("loc=clientip our self???")
    } else {
        console.log("change client IP to actual IP");
        queryStringParameterse.location = "ip:" + request.connection.remoteAddress;
    }
  }

  var myQueryString = qs.stringify(queryStringParameterse);

  console.log(myQueryString);

  var options = {
    host: 'api.songkick.com',
    path: '/api/3.0/events.json?' + myQueryString
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
      if (chunk) {
        data += chunk;
      }

      var songKickdata = JSON.parse(data);



      async.forEach(songKickdata.resultsPage.results.event, foreachEventCB, 
        function(err){
          if (err) {
            console.log("error iterating for youtube links: " + err);
          } else {
            console.log("we have our data1!");
            // response.writeHead(200, {
            //   "Content-Type": "application/json",
            //   "Access-Control-Allow-Origin": "*"
            // });

            // response.write(JSON.stringify(songKickdata));
            // response.end;
            response.json(songKickdata);
            console.log("we have our data!");
          }
    // if any of the saves produced an error, err would equal that error
      });
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