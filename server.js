/*
Workr Server JS
Frank Giddens
November 1, 2019
*/

"use strict";

const fs = require("fs");
const os = require("os");
const url = require("url");
const http = require("http");
const https = require("https");
const io = require("socket.io");
const request = require("request");

const keys = {"https" : {"key" : "key.key", "cert" : "cert.crt"}, "busApi" : {"key" : "de713def1dd3cff1bed79903d595bc05"}, "jobsApi" : {"key" : "aFek6HZ9QKX16ta8JJ9QRhduJebCVxDxSyBtChBc4SGaES1YpltcUUBkJ5fR8RbMt2vQy8i4thZm5Dx5", "secret" : "h4g4TWyiXgpjNz"}};

let server = {"main" : null, "redirect" : null};
let port = {"http" : 80, "https" : 443, "test" : 8080};
let listener;

let info = {"events" : null, "jobs" : null};

const fetchEvents = () => {
    request.get("https://jobs.api.sgf.dev/api/event?api_token=" + keys.jobsApi.key, (err, res, body) => {
        if(err){
            console.log("Event Fetch Error: " + err);
        }
        else{
            if(res && res.statusCode == 200){
                info.events = JSON.parse(body);
            }
            else{
                console.log("Event Fetch Status Code: " + res.statusCode);
            }
        }
    });
};

const fetchJobs = () => {
    request.get("https://jobs.api.sgf.dev/api/job?api_token=" + keys.jobsApi.key, (err, res, body) => {
        if(err){
            console.log("Event Fetch Error: " + err);
        }
        else{
            if(res && res.statusCode == 200){
                info.jobs = JSON.parse(body);
            }
            else{
                console.log("Event Fetch Status Code: " + res.statusCode);
            }
        }
    });
};

const getIPAddress = () => {
	let address = "127.0.0.1";
	let interfaces = os.networkInterfaces();
	for(let devName in interfaces){
		let iface = interfaces[devName];
		for(let i = 0; i < iface.length; i++){
			let alias = iface[i];
			if(alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal){
				address = alias.address;
			}
		}
	}
	return address;
};

const handleRequest = (req, res) => {
	let pathname = url.parse(req.url).pathname;
	if(pathname.indexOf(".") === -1){
		pathname += ".html";
	}
	if(pathname.indexOf("/") === 0){
		pathname = pathname.substr(1);
	}
	if(pathname === ".html"){
		pathname = "index.html";
	}
	fs.readFile(pathname, (err, data) => {
		if(err){
			res.writeHead(404, {"Content-Type" : "text/html"});
		}
		else{
			switch(pathname.substr(pathname.lastIndexOf(".") + 1)){
				case "css":
					res.writeHead(200, {"Content-Type" : "text/css"});
					res.write(data.toString());
					break;
				case "html":
					res.writeHead(200, {"Content-Type" : "text/html"});
					res.write(data.toString());
					break;
				case "js":
					res.writeHead(200, {"Content-Type" : "text/js"});
					res.write(data.toString());
                    break;
                case "woff2":
                    res.writeHead(200, {"Content-Type" : "application/font-woff2"});
                    res.write(data);
                    break;
				default:
					res.writeHead(200, {"Content-Type" : "text/plain"});
					res.write(data.toString());
					break;
			}
		}
		res.end();
	});
};

const redirectRequest = (req, res) => {
    res.writeHead(301, {"Location" : "https://workr.ml"});
    res.end();
};

const initServer = () => {
    fetchEvents();
    fetchJobs();
    /*
    server.main = https.createServer(keys.https, handleRequest);
    server.main.listen(port.https, getIPAddress());
    server.redirect = http.createServer(redirectRequest);
    server.redirect.listen(port.http, getIPAddress());
    */
	server.main = http.createServer(handleRequest);
	server.main.listen(port.test, getIPAddress());
    listener = io.listen(server.main);
	listener.sockets.on("connection", (socket) => {
        socket.on("reqEvents", (data) => {
            socket.emit("recEvents", info.events);
        });
        socket.on("reqJobs", (data) => {
            socket.emit("recJobs", info.jobs);
        });
    });
    console.log("Workr Server active at " + getIPAddress() + ":" + port.test);
};

initServer();