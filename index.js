var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var moment = require('moment');
var persons = [];

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
    io.emit('chat message', name + ": " + msg + "   " + moment().get('hour') + ":" + moment().get('minute'));
  });

  socket.on('addPerson', function(name){
    persons.push(name);
    console.log(persons);
  })
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
