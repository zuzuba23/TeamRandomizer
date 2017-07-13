//https://bootswatch.com/solar/#indicators
var app = require('express')();
var http = require('http').Server(app);

var util = require('util');
var express = require('express');
var fs = require('fs');

app.use(express.static(__dirname + '/img'));


app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/js', express.static(__dirname + '/scripts'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/user.html');
});

app.get('/admin', function(req, res){
	res.sendFile(__dirname + '/views/admin.html');
});

var server_port = process.env.PORT || 8080;


var server = app.listen(server_port, function(){
 console.log("Listening on " 
           + ", server_port " + server_port);
});
var io = require('socket.io').listen(server);



var users = [];
var admin;
var seconds;
io.on('connection', function(socket){
	console.log('A user connected');
	
	socket.on('disconnect', function () {
		if(socket != admin){
			var index = users.indexOf(socket);
			console.log('A user disconnected');
			if(index > -1){
				users.splice(index,1);
			}
		} else if(socket == admin){
			admin = null;
			users.forEach(function(item){
				item.emit('adminDisconnectedFromServer');
			});
		}
		sendListOfPlayers();
	});

	socket.on('userSelectName', function(data){
		var x = 0;
		users.forEach(function(item){
			if(item.nickname == data)
				x = 1;
		});
		if(admin)
			if(admin['nickname'] == data)
				x = 1;
		if(x == 0){
			socket.emit('serverRegisteredUser',data);
			socket['nickname'] = data;
			socket['ready'] = false;
			users.push(socket);
			if(admin != null)
				socket.emit('adminConnectedToServer', admin['nickname']);
			sendListOfPlayers();
		} else{
			socket.emit('userAlreadyExists');
		}
	});
	
	socket.on('kickPlayer',function(name){
		users.forEach(function(item){
			console.log(item.nickname);
			if(item.nickname == name){
				var index = users.indexOf(item);
				if(index > -1){
					item.emit('youHaveBeenKicked');
					users.splice(index,1);
				}
			}
		});
		sendListOfPlayers();
	});
	
	socket.on('adminConnected',function(adminName){
		socket['ready'] = true;
		socket['nickname'] = adminName;
		admin = socket;
		users.forEach(function(item){
			item.emit('adminConnectedToServer', admin['nickname']);
		});
		sendListOfPlayers();
	});
	
	socket.on('startProcess',function(){
		seconds = 4;
		emitForSeconds();
	});
	
	socket.on('userChangeStatus',function(){
		socket['ready'] = !socket['ready'];
		sendListOfPlayers();
	});
	
	socket.on('clearTeams',function(){
		users.forEach(function(item){
			item.emit('clearTeams');
		});
	});
	
	socket.on('changeChampion',function(){
		const folder = __dirname + '/img/champions/';
		var imgList = [];
		fs.readdir(folder, function(err, files){
			files.forEach(function(item){
				imgList.push(item);
			});
			var item = imgList[Math.floor(Math.random()*imgList.length)];
			//console.log(item);
			fs.readFile(__dirname + '/img/champions/' + item, function(err, data){
				//socket.emit('imageConversionByClient', { image: true, buffer: data });
				socket.emit('newChampion', "data:image/png;base64,"+ data.toString("base64"));
			});
		});
	});
});

function sendListOfPlayers(){
	if(users != null){
		var unames = [];
		users.forEach(function(item){
			unames.push({'nick' : item['nickname'],'status' : item['ready']});
		});
		if(admin != null){
			unames.push({'nick' : admin['nickname'], 'status' : admin['ready']});
			admin.emit('playerList',unames);
		}
		users.forEach(function(item){
			item.emit('playerList',unames);
		});
	}
}

function emitForSeconds(){
	var x = setInterval(function(){
		users.forEach(function(item){
			item.emit('preparingMessage', seconds);
		});
		admin.emit('preparingMessage', seconds);
		seconds--;
		if(seconds == -1){
			clearInterval(x);
			randomizer();
		}
	},1000);
}

function randomizer(){
	var players = [];
	users.forEach(function(item){
		players.push(item['nickname']);
	});
	players.push(admin['nickname']);
	players = shuffle(players);
	var team1 = [],team2 = [];
	for(var i=0;i<players.length;i++){
		if(i < players.length / 2)
			team1.push(players[i]);
		else
			team2.push(players[i]);
	}
	var arr = [team1,team2];
	users.forEach(function(item){
		item.emit('teamsRandom',arr);
	});
	admin.emit('teamsRandom',arr);
}

setInterval(function(){
	var date = new Date();
	io.emit('time', date.toLocaleTimeString());
},1000);



function shuffle(array) {
  var copy = [], n = array.length, i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
}
