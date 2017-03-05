var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/user.html');
});

var port = process.env.PORT || 8080;

http.listen(port, function(){
	console.log('listening on *steluta:' + port);
});
