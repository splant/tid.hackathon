var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketIo = require('socket.io');

var routes = require('./routes/index');
var rooms = require('./routes/rooms');
var stories  = [];

var app = express();

var io = socketIo();
app.io = io;

function getRoomStatus() {
  var room ={ people : [] , stories: stories};

  var clients = io.sockets.adapter.rooms["123"];

  for (var clientId in clients ) {
    var socket = io.sockets.connected[clientId];//Do whatever you want with this
    room.people.push({"name": socket.name, "colour": socket.colour});
  }

  return room;
}

io.on("connection", function(socket) {

  socket.join("123");

  console.log("A user connected");
  socket.emit('welcome', {name: 'a random name'});

  socket.on('join', function(data) {

    // name our socket for future events
    socket.name = data.name;
    socket.colour = data.colour;

    // send room status to sender
    socket.emit("roomstatus", getRoomStatus());
    socket.broadcast.emit("joined", {name:socket.name,colour:socket.colour});
    console.log("Hello from "+data.name);
  });

  socket.on('disconnect', function() {
    console.log(socket.name + " disconnected");
    socket.broadcast.emit("exited",{name:socket.name,colour:socket.colour});
  });

  socket.on('createstory', function(data){
    stories.push({name: data.storyname});
    socket.broadcast.emit("createdstory",{name: data.storyname});
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/rooms', rooms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
