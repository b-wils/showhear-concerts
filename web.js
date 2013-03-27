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

var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

// var mongoConnectString = ;

var mongohost = "linus.mongohq.com";
var mongoport = "10001";

console.log("mongohq url: " + process.env.MONGOHQ_URL );

mongohqurl = process.env.MONGOHQ_URL || 'mongodb://heroku:spdr67BG@linus.mongohq.com:10002/app9516817';
console.log("mongohq url2: " + mongohqurl );
var app = express.createServer(express.logger());

// function foreachCB(item, callback) {
//   console.log("foreachCB: " + item);
//   callback();
// }

// async.forEach(["item1", "item2"], foreachCB, function(err){
//   console.log("foreach error");
// // if any of the saves produced an error, err would equal that error
// });

      

var dbURL = process.env.DATABASE_URL || 'postgres://localhost:5432/showhear';

// var connectionString = process.env.DATABASE_URL || 'postgres://postgres:magnum45@localhost:5432/showhear'
//   , client
//   , query;

// client = new pg.Client(connectionString);
// client.connect();

var oneYear = 31557600000;
var oneDay = 86400;
var oneHour = 3600;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jshtml');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public', {}));

  app.use("/Styles", express.static(__dirname + '/Styles'));
  app.use("/images", express.static(__dirname + '/images'));
  app.use("/js", express.static(__dirname + '/js'));
  app.use("/css", express.static(__dirname + '/css'));
  app.use("/jsdatepick-calendar", express.static(__dirname + '/jsdatepick-calendar'));
  app.use("/jsdatepick-calendar/img", express.static(__dirname + '/jsdatepick-calendar/img'));
  app.use("/Scripts", express.static(__dirname + '/Scripts'));
  app.use("/jquery-ui-1.9.2.custom", express.static(__dirname + '/jquery-ui-1.9.2.custom'));
  app.use("/jquerycookie", express.static(__dirname + '/jquerycookie'));
  app.use("/jquery-ui-1.10.0.custom", express.static(__dirname + '/jquery-ui-1.10.0.custom'));

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

app.get('/', function(req, res) {
   //response.send('Hello World!');
   //response.send('Hello World again!');
   res.render('GigCast', {
     locals: {
      }
    });

   // var statsmixClient = new statsmix.Client();
   // statsmixClient.addMetric('Foo metric', fooCounterMetric, { track : true });
});


app.get('/area/:areaid', function (req, res) {

   res.render('GigCast', {
     locals: {
        area: req.params.areaid
      }
    });
});

app.get('/area', function (req, res) {
  // console.log('Received area id ' + req.params.areaid + '');
   res.render('GigCast');
});

app.get('/data/:type', function (req, res) {
  console.log('Received ' + req.params.type + ' data');
  res.json({"data": req.params.type});
});

app.post('/logerror', function(request, response) {
    util.log("Client Error: " + request.body.msg);
    response.json({ 'status':"OK"})
});

app.get('/test', function(request, response) {
   //response.send('Hello World!');
   //response.send('Hello World again!');
   // response.render('GigCast.html', {
    console.log("here= ", request.query["heref"]);

   response.json({ 'testvar':"defaultme", "sqlquery":"none"})
});

// MongoClient.connect(mongohqurl", function(err, db) {
//   if(!err) {
//     console.log("We are mongo connected");
//     db.collection('testCollection2', function(err, collection) {
//       if(!err) {
//         // console.log(collection);

//         var doc1 = {'hello':'doc1'};
//         var doc2 = {'hello':'doc2'};
//         var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

//         // collection.insert(doc1, function(err, result) {});

//         collection.find().toArray(function(err, items) {console.log(items)});
//       } else {
//         console.log("could not get collection");
//       }
//     });
//   } else {
//     console.log("monog connect error");
//   }
// });

var myDb;

MongoClient.connect(mongohqurl, function(err, db) {
  if(!err) {
    myDb = db;
  } else {
    console.log("initial mongo connect error");
  }
}); 

function foreachArtistCB(item, artistCallback) {
      // console.log("We are mongo connected");
    item.testing = "hello";

    myDb.collection('artistVideos', function(err, collection) {
      if(!err) {

        // database querying
        collection.find({songkickId:item.artist.id}).toArray(function(err, items) {
          
          if (items==null) {
            console.log("mongo error: could not find items");
            artistCallback();
            return;
          }

          if (items.length > 0) {
            // we have seen artist before
            // console.log("artist in db - " );
            // console.log(items);
            // console.log(items[0]);
            // console.log(items[0].videos[0]);
            if (items[0].hasVideos === "true") {
              item.artist.youtubeID = items[0].videos[0].youtubeId;
            } else {
              console.log("no known videos for artist");
            }
            
            // item.artist.testies = "testiesme";
            artistCallback();
          } else {
            // find videos
            // console.log("searching for artist");
            youtube.feeds.videos( {
                                    q: item.artist.displayName,
                                    category: "Music",
                                    key: youtubeDeveloperKey,
                                    'max-results':  2,
                                  }
                                , function( err, data ) {

              if( err instanceof Error ) {
                  console.log( "youtube feed error for "+item.artist.displayName+":" + err );
                  if (err.message === "not found") {
                    console.log("couldnt find artist on youtube, logging in db");

                    var insertData = {
                      songkickId:item.artist.id,
                      artistName:item.artist.displayName,
                      hasVideos:"false",
                    }

                    collection.insert(insertData, function(err, result) {
                      if (err) {
                        console.log("insert failed");
                      } else {
                        console.log("insert succeeded");
                      }
                    });
                  } else {
                    console.log( "unknown youtube feed error for "+item.artist.displayName+":" + err );
                  }
                  artistCallback();
              } else {
                  // console.log( data );
                  // res.json(data);
                  item.artist.youtubeID = data.items[0].id;
                  item.artist.youtubeURL = data.items[0].player.default;
                  artistCallback();

                  var insertData = {
                    songkickId:item.artist.id,
                    artistName:item.artist.displayName,
                    hasVideos:"true",
                    videos: [{
                              youtubeId:data.items[0].id, 
                              title:data.items[0].title, 
                              createTime:new Date().getTime(),
                              source:"youtubeAutoSearch"
                            }]
                  }

                  collection.insert(insertData, function(err, result) {
                    if (err) {
                      console.log("insert failed");
                    } else {
                      // console.log("insert succeeded");
                    }
                  });
              }
            });
          }
        });
      } else {
        console.log("could not get collection");
      }
    });
}

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

function foreachEventCB(item, eventCallback) {
  async.forEach(item.performance, foreachArtistCB, 
    function(err){
      if (err) {
        console.log("error iterating for youtube links: " + err);
      } else {
        // item.testval = "eventTesting!";
        eventCallback();
      }
// if any of the saves produced an error, err would equal that error
  });

  // console.log(item.displayName);
}

// app.get('/data/:type', function (req, res) {
//   console.log('Received ' + type + ' data');
// });

app.get('/data', function (req, res) {
  console.log('Received no path ' +  ' data');
  res.json({"data": "none"});
});

// JSON responses
app.get('/events.json', function(request, response) {
  //response.send('Hello World!');
  //response.send('Hello World again!');
  // response.render('GigCast.html', {

  // var http = require('http');

  // response.setHeader('Cache-Control', 'public, max-age=' + oneHour);
  // console.log('HEADERS: ' + JSON.stringify(response.headers));

  var myClientIp = getClientIp(request);

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
    // console.log("page required");
    // response.json({status:"error", message:"page required"});
    request.query["page"] = 1;
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
    if (myClientIp == "127.0.0.1") {
      // console.log("loc=clientip our self???");
    } else {
        // console.log("change client IP to actual IP");
        queryStringParameterse.location = "ip:" + myClientIp;
    }
  }

  var myQueryString = qs.stringify(queryStringParameterse);

  // console.log(myQueryString);

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

      // BUG we errored out here somehow- if our results do not have any data
      // hardcoded to 50 per page
      if (songKickdata.resultsPage.totalEntries - (songKickdata.resultsPage.page -1) * songKickdata.resultsPage.perPage> 0) {
        // console.log(songKickdata.resultsPage.totalEntries);
        async.forEach(songKickdata.resultsPage.results.event, foreachEventCB, 
          function(err){
            if (err) {
              console.log("error iterating for youtube links: " + err);
            } else {
              // response.writeHead(200, {
              //   "Content-Type": "application/json",
              //   "Access-Control-Allow-Origin": "*"
              // });

              // response.write(JSON.stringify(songKickdata));
              // response.end;
              songKickdata.start = "helloyou";
              response.json(songKickdata);
            }
      // if any of the saves produced an error, err would equal that error
        });
      }else {
        response.json(songKickdata);
      }
    });

    // response.json({ 'testvar':"success"})
  }).on('error', function(e) {
    console.log('ERROR: ' + e.message);
    response.json({ 'testvar':"error"})
  });

  // response.json({ 'testvar':"default"})
});

function calendarEventCBWrapper(data, eventCallback) {
  foreachEventCB(data.event, eventCallback);
}

app.get('/users/:username/calendar.json', function(request, response) {
  //response.send('Hello World!');
  //response.send('Hello World again!');
  // response.render('GigCast.html', {

  // var http = require('http');

  if(!request.query["page"]) {
    request.query["page"] = "1";
  }

  if(!request.query["reason"]) {
    console.log("reason required");
    response.json({status:"error", message:"reason required"});
    return;
  }

  var queryStringParameterse = {
    apikey: "bUMFhmMfaIpxiUgJ",
    page: request.query["page"],
    reason: request.query["reason"]
  }

  var myQueryString = qs.stringify(queryStringParameterse);

  // console.log(myQueryString);

  var options = {
    host: 'api.songkick.com',
    path: '/api/3.0/users/' + request.params.username + '/calendar.json?' + myQueryString
  };

  // console.log(options.host + options.path);

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


      if (songKickdata.resultsPage.totalEntries - (songKickdata.resultsPage.page -1) * songKickdata.resultsPage.perPage> 0) {
        async.forEach(songKickdata.resultsPage.results.calendarEntry, calendarEventCBWrapper, 
          function(err){
            if (err) {
              console.log("error iterating for youtube links: " + err);
            } else {
              // response.writeHead(200, {
              //   "Content-Type": "application/json",
              //   "Access-Control-Allow-Origin": "*"
              // });

              // response.write(JSON.stringify(songKickdata));
              // response.end;
              response.json(songKickdata);
            }
      // if any of the saves produced an error, err would equal that error
        });
      } else {
        response.json(songKickdata);
      }
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