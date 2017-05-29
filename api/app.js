'use strict';
require('dotenv').load();
var path = require('path');
var PORT = process.env.port || 3000;
var ENV = process.env.NODE_ENV || 'development';
process.chdir(__dirname);
// setup http + express + socket.io
var express = require('express'); //Frist call mvc 
var app = module.exports = express();
// setup deployd
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  'log level': 0
});
require('deployd').attach(server, {
  socketIo: io,
  env: ENV,
  db: {
    connectionString: process.env.CONNECTION_STRING || process.env.DEV_DB_STRING || 'mongodb://10.5.50.16:27017/thaihome'
  }
});
 


var dpdRoutes = ["dashboard", "__resources", "socket.io"];
app.use(express.static('public'));
app.use('/api/', server.handleRequest);	
app.get('/[^\.]+$', function(req, res, next)
{    
    var first_path = req.path.split('/');

    if(dpdRoutes.indexOf(first_path[1]) > -1) // dpd requests
    {
		app.use(server.handleRequest);
        return next();
    }
    else // angular requests
    {	  
       res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

});

/*
app.use(express.static('public'));
app.use('/api/', server.handleRequest);	
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});*/


//app.use(server.handleRequest);
// After attach, express can use server.handleRequest as middleware

// start server
server.listen(PORT);
server.on('listening', function () {
  console.log('Server is listening on port: ' + (process.env.PORT || 3001));
});
server.on('error', function (err) {
  console.error(err);
  process.nextTick(function () { // Give the server a chance to return an error
    process.exit();
  });
});