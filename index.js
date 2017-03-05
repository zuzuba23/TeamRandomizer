var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/user.html');
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ipadd = process.env.OPENSHIFT_NODEJS_IP || 127.0.0.1

http.listen(port,ipadd, function(){
	console.log('listening on *steluta:' + port);
});
