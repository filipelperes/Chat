var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
