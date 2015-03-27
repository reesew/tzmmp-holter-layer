var http = require("http");
var express = require("express");
var app = express();
var getRawBody = require('raw-body');
var request = require('request');
var apiUrl = process.env.API_URL;
var apiBase = "/rest/aera-ct";

app.get("/settings/download/:serial", function(req, res, next) {
	console.log("overriding settings download");
	var serial = req.params.serial;
	function onGetPatientId(err, response, body) {
		console.log("body:", body);
		var patientId = parseInt(body);
		console.log("patientId:", patientId);
		var settings = {
			patientId: patientId,
			wirelessEnable: false
		};
		json = JSON.stringify(settings);
		console.log("settings json", json);
		var requestOptions = {
			host: apiUrl,
			port: 80,
			path: apiBase + "/settings/set/" + serial,
			method: 'PUT',
			headers: {
				'Content-Length': json.length,
				'Content-Type': 'application/json'
			}
		};
		var override = http.request(requestOptions, function(res) {
			console.log("inside request override");
			res.setEncoding('utf8');
			res.on('error', function(err) {
				console.log('override error:', err);
				res.status(500);
				res.json({error: "Something went wrong"});
			});
			res.on('data', function(chunk) {
				console.log('override response:', chunk);
				console.log('next');
				next();
			});
		});
		override.on('error', function(e) {
			console.log("override request error:", e);
			res.status(500);
			res.json({error: "Something went wrong"});
		});
		override.write(json);
		override.end();
	}
	request("http://increment/patientId", onGetPatientId);
});

app.use(function(req, res, next) {
	console.log("Got request");
	console.log("apiUrl", apiUrl);
	console.log("request.url", req.url);
	var url = "http://" + apiUrl + req.url;
	var inner = request(url);
	var piped = req.pipe(inner);
	var res = piped.pipe(res);
	//req.pipe(request(url)).pipe(res);
});

console.log("starting server");
var server = app.listen(80, function() {
	console.log("inside listen?");
});
