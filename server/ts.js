var querystring = require('querystring');
var http = require('http');
var util = require('util');

// constants
//
var INTERVAL = 60000 * 1;


var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});

wss.on('connection', function(ws) {
	console.log('Connection : ' + ws._socket.remoteAddress + ':' + ws._socket.remotePort);

	// server always sets the report interval on startup
	var intervalMessage = {
		id: 'INTERVAL',
		data: INTERVAL
	};

	var ackMessage = {
		id: 'ACK'
	};

	ws.send(JSON.stringify(intervalMessage));

	ws.on('message', function(message) {
        	console.log('received: %s', message);
		
		ws.send(JSON.stringify(ackMessage));
/*
		// send a http request to the local sails server
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': message.length
		};
		var options = {
			host: '127.0.0.1',
			port: '1337',
			path: '/temperaturei/',
			method: 'POST',
			headers: headers
		};
		var req = http.request(options, function(res) {
			res.setEncoding('utf-8');

			var responseString = '';

			res.on('data', function(data) {
				responseString += data;
			});

			res.on('end', function() {
		
				console.log(responseString);
				var responseObject = JSON.parse(responseString);
				success(responseObject);
			});
		});

*/
	});

	ws.on('error', function(e) {
		console.log(e);
	});
});


