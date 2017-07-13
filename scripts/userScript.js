var socket = io();
	var username = 'USER';
	
	socket.on('connect',function(){
		socket.emit('changeChampion');
	});
	
	$('#submitBtn').click(function(){
		socket.emit('userSelectName',$('#username').val());
		username = $('#username').val();
	});
	
	$('#corleonyButton').click(function(){
		socket.emit('userSelectName','Corleony');
		username = 'Corleony';
	});
	
	$('#statusChangeBtn').click(function(){
		if($('#statusMsg').attr('status') == 0){
			$('#statusMsg').attr('status',1);
			$('#statusMsg').attr('class','text-success');
			$('#statusMsg').html('Ready');
			$('#statusImgDiv').html('<img src="ready.png" height="20" width="20">');
		}else{
			$('#statusMsg').attr('status',0);
			$('#statusMsg').attr('class','text-warning');
			$('#statusMsg').html('Not Ready');
			$('#statusImgDiv').html('<img src="not_ready.png" height="20" width="20">');
		}
		socket.emit('userChangeStatus');
	});
	
	socket.on('serverRegisteredUser',function(data){
		$('#loginPanel').hide();
		$('#titleUsername').html('Hello, ' + data + '<br><p id="adminStatusMsg" class="text-warning">Waiting for admin...</p>');
		$('#statusDiv').show();
	});
	
	socket.on('adminConnectedToServer',function(data){
		$('#adminStatusMsg').html('Admin ' + data + ' is connected.');
		$('#adminStatusMsg').attr('class','text-success');
	});
	
	socket.on('adminDisconnectedFromServer',function(){
		$('#adminStatusMsg').html('Waiting for admin...');
		$('#adminStatusMsg').attr('class','text-warning');
	});
	
	socket.on('playerList',function(data){
		html = '<ul class="list-unstyled">';
		data.forEach(function(item){
			if(item.status == true){
				html += '<li style="color:green;"><div class="row">' + '<div class="col-md-1"><img src="ready.png" height="20" width="20"></div><div class="col-md-10"><h3 style="margin-top:0px;">' +  item.nick + '</h3></div></div></li>';
			} else{
				html += '<li style="color:green;"><div class="row">' + '<div class="col-md-1"><img src="not_ready.png" height="20" width="20"></div><div class="col-md-10"><h3 style="margin-top:0px;">' +  item.nick + '</h3></div></div></li>';
			}
		});
		html += '</ul>';
		$('#playersStatus').html(html);
	});
	
	socket.on('userAlreadyExists',function(){
		$('#errorModal').modal("show");
	});
	
	socket.on('teamsRandom',function(data){
		html = '';
		html += '<table class="table table-hover "><thead><tr><th>Echipa 1</th><th>Echipa 2</tr></thead>';
		for(var i=0;i<data[0].length;i++){
			html += '<tr><td>';
			html += data[0][i] + '</td><td>' + data[1][i] + '</td>';
			html += '</tr>';
		}
		html += '</table>';
		$('#teams').html(html);
		$('#statusChangeBtn').show();
	});
	
	var firstTime = 1;
	var percent;
	socket.on('preparingMessage',function(data){
		if(firstTime == 1){
			percent = 100/data;
		}
		$('#teams').html('<div class="progress progress-striped active">\
							<div class="progress-bar" style="width: ' + firstTime * percent + '%"></div>\
						</div>');
		firstTime ++;
		$('#statusChangeBtn').hide();
	});
	
	socket.on('time',function(data){
		$('#title2').html(username + ' - ' + data);
	});
	
	socket.on('newChampion',function(data){
		$("#championImage").attr("src",data);
	});
	
	socket.on('youHaveBeenKicked',function(){
		location.reload();
	});
	
	socket.on('clearTeams',function(){
		firstTime = 1;
		$('#teams').html('');
	});
	
	function ChangeChampion() {
		socket.emit('changeChampion');
	}