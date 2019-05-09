var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'client')));

var users = [];

app.get('/', function(req, res){
  res.sendFile('/client/index.html', {root:'.'});
});

io.on('connection', function(socket){

  //Se algum cliente é desconectado do servidor
  //é ativado esse evento
  socket.on('disconnect', (reason) => {
    users.splice(users.indexOf(socket.name), 1);
    socket.broadcast.emit('close person', socket.name, users);
  });

  //Se alguma nova mensagem é escrita, esse evento
  //vai ser ligado
  socket.on('chat message', (data) => {
    socket.broadcast.emit('chat message', data);
  });

  socket.on('typing', (msg) => {
    socket.broadcast.emit('typing', msg);
  })

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  })

  socket.on('addPerson', function(name){
    socket.name = name;
    users.push(name);

    socket.emit('welcomeMessage', users);

    socket.broadcast.emit('addPerson', socket.name, users);
  })
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
