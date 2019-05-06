var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var moment = require('moment');

app.get('/', function(req, res){
  res.sendFile('/index.html', {root:'.'});
});

io.on('connection', function(socket){
  //Quando alguém entra no site, esse evento
  //é acionado
  io.emit('new person');

  //Se algum cliente é desconectado do servidor
  //é ativado esse evento
  socket.on('disconnect', (reason) => {
    io.emit('close person')
  });

  //Se alguma nova mensagem é escrita, esse evento
  //vai ser ligado
  socket.on('chat message', function(msg, name){
    io.emit('chat message', moment().get('hour') + ":" + moment().get('minute') + "  " + name + ": " + msg);
  });

  socket.on('typing', function(name){
    io.emit('typing', name + " is typing");
  })

  socket.on('addPerson', function(name){
    io.emit('addPerson', name);
  })
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
