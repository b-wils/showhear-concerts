var express = require('express');

var app = express.createServer(express.logger());

app.register('.html', require('jade'));

app.get('/', function(request, response) {
  response.send('Hello World!');
  //response.render('foo.html');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});