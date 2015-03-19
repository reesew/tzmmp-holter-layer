var http = require("http");
var express = require("express");
var app = express();
var getRawBody = require('raw-body');
var req = require('request');
var apiUrl = process.env.API_URL;
var apiBase = "/rest/aera-ct";

app.get("/settings/download/:serial", function(request, response, next) {
	console.log("overriding settings download");
	var serial = request.params.serial;
	var settings = {
		121: "01"
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
			response.status(500);
			response.json({error: "Something went wrong"});
		});
		res.on('data', function(chunk) {
			console.log('override response:', chunk);
			console.log('next');
			next();
		});
	});
	override.on('error', function(e) {
		console.log("override request error:", e);
		response.status(500);
		response.json({error: "Something went wrong"});
	});
	override.write(json);
	override.end();
});

app.use(function(request, response, next) {
	console.log("Got request");
	console.log("apiUrl", apiUrl);
	console.log("request.url", request.url);
	var url = "http://" + apiUrl + request.url;
	var inner = req(url);
	var piped = request.pipe(inner);
	var res = piped.pipe(response);
	//request.pipe(req(url)).pipe(response);
});

console.log("starting server");
var server = app.listen(80, function() {
	console.log("inside listen?");
});
