var express = require('express'); // Flamework do Servidor
var app     = express(); // Váriavel do express
var http    = require('http').Server(app); // Servidor em si
var io      = require('socket.io')(http); // Socket io usando o servidor
var path    = require('path'); // Módulo para manipular caminhos
var port    = process.env.PORT || 3000; // Porta do servidor

// Mandando o Express rodar estáticamente a pasta client
app.use(express.static(path.join(__dirname, 'client'))); 

// Váriavel que armazena as pessoas online
var users = [];

// Na rota principal, a página é carregada 
app.get('/', function(req, res){
  res.sendFile('/client/index.html', {root:'.'});
});

// Quando se tem uma conexão no servidor, esse evento é chamado
io.on('connection', function(socket){

  //Se algum cliente é desconectado do servidor, esse evento é chamado
  socket.on('disconnect', (reason) => {
    users.splice(users.indexOf(socket.name), 1);
    socket.broadcast.emit('close person', socket.name, users);
  });

  //Se alguma nova mensagem é enviada, esse evento é chamado
  socket.on('chat message', function(data, options){
    socket.broadcast.emit('chat message', data, options);
  });

  // Quando alguém entra na sala, esse evento é chamado
  socket.on('addPerson', function(name){
    socket.name = name;
    users.push(name);

    socket.emit('welcomeMessage', users);

    socket.broadcast.emit('addPerson', socket.name, users);
  })
});

// Rodando o servidor na determinada porta
http.listen(port);
