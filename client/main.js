var moment = moment(); // Váriavel para saber o tempo atual

$(function () {
    var socket = io(); // Váriavel para poder usar o Socket entre o Cliente e Servidor

    var name = ''; // Nome do Cliente
    var img; // Objeto da Imagem

    var $modal       = $('#myModal'); // Tela de inserção do usuário para acessar o site
    var $formMsg     = $('#formMsg'); // Formulário que engloba o input, botão e o botão da imagem
    var $formUser    = $('#formUser'); // Formulário que engloba o input e o botão
    var $uploadImage = $('.upload-options'); // Botão da imagem
    var $message     = $('#message'); // Lista de mensagens
    var $group       = $('#group'); // Lista das pessoas online
    var $cardChat    = $('#card-chat'); // Card onde engloba todo o escopo de mensagens e inserção de nova mensagem
    var $cardBody    = $('#card-msg'); // Card que contém apenas as mensagens
    var $window      = $( window ); // Tela do site

    // A tela de login é ligada
    $modal.modal({             
      backdrop: 'static',
      keyboard: false,
      focus: false,
      show: true
    });

    // Função para quando é mudado o tamanho da tela
    function resize(){
      $cardChat.height($window.height() - 50 );
      $cardBody.height($window.height() - 50 );     
    }

    // Função para registrar o nome do usuário
    function setUser(name){
      socket.emit('addPerson', name);
      $modal.modal('hide');
    }

    // Função que insere a mensagem no corpo do html
    function addMessageChat(data, options) {
      var msg = options.log ? data.msg : data.name + ": " + data.msg;
      if(options.image){
        if(options.right){
          var reader = new FileReader();
          reader.onload = function(e) {
            $message.append($('\
              <div class="outgoing_msg">\
                <div class="sent_msg">\
                  <div class="card">\
                    <a href="#" id="img-chat"><img class="card-img-top" src=' + e.target.result + ' style="width:100%; height:250px;"></img></a>\
                    <div class="card-body" style="padding: 0px">\
                      <p style="border-radius: 0px;">' + msg + '</p>\
                    </div>\
                  </div>\
                  <span class="time_date"> ' + data.time + '</span>\
                </div>\
              </div>'
            ));
          };
          reader.readAsDataURL(data.image);
        } else{
          var uint8Arr = new Uint8Array(data.image);
          var binary = '';
          for (var i = 0; i < uint8Arr.length; i++) {
              binary += String.fromCharCode(uint8Arr[i]);
          }
          var base64String = window.btoa(binary);
      
          var img = new Image();
          img.src = 'data:image/png;base64,' + base64String;
          $message.append($('\
            <div class="incoming_msg">\
              <div class="received_msg">\
                <div class="received_withd_msg">\
                  <div class="card">\
                    <a href="#" id="img-chat"><img class="card-img-top" src=' + img.src + ' style="width:100%; height:250px;"></img></a>\
                    <div class="card-body" style="padding: 0px">\
                      <p style="border-radius: 0px;">' + msg + '</p>\
                    </div>\
                  </div>\
                  <span class="time_date"> ' + data.time + '</span>\
                </div>\
              </div>\
            </div>'
          ));
        }
      } else {
        var right = '\
          <div class="outgoing_msg">\
            <div class="sent_msg">\
              <p>' + msg + '</p>\
              <span class="time_date"> ' + data.time + '</span>\
            </div>\
          </div>'
        var left = '\
          <div class="incoming_msg">\
            <div class="received_msg">\
              <div class="received_withd_msg">\
                <p>' + msg +  '</p>\
                <span class="time_date">' + data.time + '</span>\
              </div>\
            </div>\
          </div>'
        $message.append($(
          options.right ? right : left
        ));
      }

      $cardBody.scrollTop($cardBody[0].scrollHeight);
    };

    // Função para adicionar uma pessoa a lista de quem está online
    function addGroupChat(list) {
      $group.append(list);
    }

    // Função para carregar as pessoas que estão online
    function generateGroup(group) {
      var list = document.createElement('ul');
      list.setAttribute("class", "list-group list-group-flush");

      for(var i = 0; i < group.length; i++) {
          var item = document.createElement('li');
          
          item.setAttribute("class", "list-group-item");  
          item.appendChild(document.createTextNode(" " + group[i]));

          list.appendChild(item);
      }

      addGroupChat(list);
    }

    // Quando o botão da imagem é acionado, esse evento é chamado
    $uploadImage.on('change', function(image) {
      img = image;
      var name = image.target.files[0].name;
      var imgName = name.substring(name.lastIndexOf('.'));

      $('.upload-options label').addClass('without-img');
      if($('.without-img p').length) {
        $('.without-img p').remove();
      }
      $('.without-img').append(
        $('\
          <p style="position: absolute; left: 18%; top: 22%;">' + imgName + '</p>\
        ')
      )
    });

    // Quando ou o botão ou a tecla Enter são acionados, esse evento é chamado na tela de login
    $formUser.submit(function(e){
      if(e.currentTarget[0].value != '') {
        name = e.currentTarget[0].value;
        setUser(name);
      }
      return false;
    });

    // Quando ou o botão ou a tecla Enter são acionados, esse evento é chamado na tela principal
    $formMsg.on('submit', function(e){
      var msg = e.delegateTarget[1].value;
      if(msg.length > 0 || img) {
        var file = img ? img.target.files[0] : undefined;
        var data = {
          time: moment.get('hour') + ":" + moment.get('minute'),
          msg: msg,
          name: name,
          image: file
        }
        addMessageChat(data, {
          right: true,
          log: false,
          image: img ? true : false
        });
        socket.emit('chat message', data, {
          right: false,
          log: false,
          image: img ? true : false
        });
        $('.without-img p').remove();
        $('.upload-options label').removeClass('without-img');
        img = undefined;

        e.delegateTarget[1].value = '';
      }
      return false;
    })

    // Quando se clica em alguma imagem no chat, esse evento é chamado
    $message.on('click', 'a', function(){
			$('.imagepreview').attr('src', $(this).find('img').attr('src'));
      $('#imagemodal').modal('show'); 
      return false;  
    })

    // Esse evento faz com que as mensagens sejão escritas para todos os usuários menos o próprio
    // que enviou
    socket.on('chat message', function(data, options){
      addMessageChat(data, options);
    })

    // Quando algum novo usuário entra, essa função é chamada para o próprio usuário, contendo
    // todas as pessoas online atualmente e mostrando uma mensagem 
    socket.on('welcomeMessage', function(users){
      addMessageChat({
        msg: 'Bem vindo ' + name + '!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, 
      { 
        right: false,
        log: true
      })
      generateGroup(users);
      $message.scrollTop($message.height());
    })

    // Quando algum novo usuário entra, essa função é chamada para todos online, menos o próprio
    // que entrou, adicionando na lista de pessoas online e mostrando uma mensagem
    socket.on('addPerson', (name, users) => {
      addMessageChat({  
        msg: name + ' acabou de entrar na sala!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, 
      { 
        right: false,
        log: true
      })
      $group[0].removeChild($group[0].childNodes[1]);
      generateGroup(users);
      $message.scrollTop($message.height());
    })

    // Quando algum novo usuário entra, essa função é chamada para todos online, menos o próprio
    // que entrou, removendo o usuário de pessoas online e mostrando uma mensagem
    socket.on('close person', (name, users) => {
      addMessageChat({  
        msg: name + ' saiu da sala!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, { 
        right: false,
        log: true
      })
      $group[0].removeChild($group[0].childNodes[1]);
      generateGroup(users);
      $message.scrollTop($message.height());
    })

    // Quando a tela mudar de tamanho essa função será chamada
    $window.resize(function() {
      resize();
    });

    // Ajustar a tela pela primeira vez
    resize();
});
