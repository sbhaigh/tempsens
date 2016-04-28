// temperature.js - NodeJS temperature reading
// Steve Haigh - 20/02/2015

var fs = require('fs');

// constants
var SENSOR_ID = '28-000005d02c70';
var SERVER = 'ws://54.154.118.112:8080';

// global data
var ws;
var reportInterval;
var connected = false;
var interval = 10000;

// Read current temperature from sensor
function readTemp(callback){
   fs.readFile('/sys/bus/w1/devices/' + SENSOR_ID + '/w1_slave', function(err, buffer) {
      if (err){
         console.error(err);
         process.exit(1);
      }

      // Read data from file (using fast node ASCII encoding).
      matches = buffer.toString('ascii').match(/t=([0-9]+)/);
      tempData = parseInt(matches[1]);
      // Extract temperature from string and divide by 1000 to give celsius
      //var temp  = tempData/1000.0;

      // Round to one decimal place
      //temp = Math.round(temp * 10) / 10;

      // Add date/time to temperature
      	var data = {
            temperature_record:[{
            sensor_id: SENSOR_ID,
            unix_time: Date.now(),
            celsius: tempData
            }]};

      // Execute call back with data
      callback(data);
   });
};

function openSocket() {
	console.log('Opening socket...');
	var WebSocket = require('ws');
  	ws = new WebSocket(SERVER);

	ws.on('open', function() {
		console.log('Socket opened');
		connected = true;
		sendTemp();
	});

	ws.on('close', function() {
		connected = false;
		console.log('Socket closed');
		openSocket();
	});

	ws.on('error', function(err) {
		connected = false;
		console.log('error: ' + err);
		setTimeout(openSocket, interval);
	});

	ws.on('message', function(message) {
    		console.log('message rcvd: %s', message);
		var msg = JSON.parse(message);
		if(msg.id == 'INTERVAL') {
			console.log('NEW INTERVAL: ' + msg.data);
			interval = parseInt(msg.data, 10);
			clearInterval(reportInterval);
			reportInterval = setInterval(sendTemp, interval);
		}

		if(msg.id == 'ACK') {
			console.log('Ack received');
		}
	});
}

function sendTemp () {
	console.log("sendTemp");
	readTemp(function(data){
		console.log('Temp: ' + data.temperature_record[0].celsius);
		if(connected) {
			ws.send(JSON.stringify(data));
		} else {
			console.log("Not sending, not connected...");
		}
	});
}

openSocket();


