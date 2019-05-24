var moment = moment();

$(function () {
    var TYPING_TIMER_LENGTH = 400; // ms
    
    var socket = io();

    var lastTypingTime;

    var name = '';
    var typing = false;
    var img;

    var $modal = $('#myModal');
    var $btnName = $('#btnName');
    var $formMsg = $('#formMsg');
    var $sendButton = $('#sendButton');
    var $sendImage = $('#sendImage');
    var $formUser = $('#formUser');
    var $uploadImage = $('.upload-options');
    var $inputName = $('#inputName');
    var $imgChat = $('#img-chat');
    var $typing = $('#typing');
    var $m = $('#m');
    var $notify = $('#notify');
    var $message = $('#message');
    var $sent_msg = $('.sent_msg');
    var $received_withd_msg = $('.received_withd_msg');
    var $group = $('#group');
    var $butt = $('#butt');
    var $cardChat = $('#card-chat');
    var $cardBody = $('#card-msg');
    var $window = $( window );

    function resize(){
      $cardChat.height($window.height() - 50 );
      $cardBody.height($window.height() - 50 );     
    }

    function setUser(name){
      socket.emit('addPerson', name);
      $modal.modal('hide');
    }

    const addMessageChat = (data, options) => {
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
        if(options.right){
          $message.append($('\
            <div class="outgoing_msg">\
              <div class="sent_msg">\
                <p>' + msg + '</p>\
                <span class="time_date"> ' + data.time + '</span>\
              </div>\
            </div>'
          ));
        } else {
          $message.append($('\
            <div class="incoming_msg">\
              <div class="received_msg">\
                <div class="received_withd_msg">\
                  <p>' + msg +  '</p>\
                  <span class="time_date">' + data.time + '</span>\
                </div>\
              </div>\
            </div>\
          '))
        }
      }

      $cardBody.scrollTop($cardBody[0].scrollHeight);
    };

    const addGroupChat = (list) => {
      $group.append(list);
    }

    const generateGroup = (group) => {
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

    const addTypingChat = (msg) => {
      $typing.text(msg);
    }

    const updateTyping = (msg) => {
      if (!typing) {
        typing = true;
        socket.emit('typing', name + "...");
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
      //$typing.text(msg);
    }
    
    $uploadImage.on('change', getFile);

    function getFile(image){
      img = image;
      var name = image.target.files[0].name;
      var imgName = name.substring(name.indexOf('.'));

      $('.upload-options label').addClass('without-img');
      if($('.without-img p').length) {
        $('.without-img p').remove();
      }
      $('.without-img').append(
        $('\
          <p style="position: absolute; left: 18%; top: 22%;">' + imgName + '</p>\
        ')
      )
    }

    $modal.modal({
      backdrop: 'static',
      keyboard: false,
      focus: false,
      show: true
    });

    $formUser.submit( function(e){
      if(e.currentTarget[0].value != '') {
        name = e.currentTarget[0].value;
        setUser(name);
      }
      return false;
    });

    $sendButton.on('click', function(){
      if(img){
        console.log('tem alguma imagem')
        var msg = $m.val();
        var file = img.target.files[0];
        var data = {
          time: moment.get('hour') + ":" + moment.get('minute'),
          msg: msg,
          name: name,
          image: file
        } 
        addMessageChat(data, {
          right: true,
          log: false,
          image: true
        });
        socket.emit('chat message', data, {
          right: false,
          log: false,
          image: true
        });
        $('.without-img p').remove();
        $('.upload-options label').removeClass('without-img');
        img = undefined;
      } else{
        console.log('não tem alguma imagem');
        var msg = $m.val();
        var data = {
          time: moment.get('hour') + ":" + moment.get('minute'),
          msg: msg,
          name: name
        }
        console.log(data)
        addMessageChat(data, {
          right: true,
          log: false,
          image: false
        });
        socket.emit('chat message', data, {
          right: false,
          log: false,
          image: false
        });
        $m.val('');
      }
      return false;
    });

    $sendImage.on('click', function(){
      console.log('imagem')
      return false
    })

    $formMsg.on('input', () => {
      updateTyping();
    })

    $message.on('click', 'a', function(){
			$('.imagepreview').attr('src', $(this).find('img').attr('src'));
      $('#imagemodal').modal('show'); 
      return false;  
    })

    socket.on('chat message', function(data, options){
      console.log(options);
      if(options.image){
        addMessageChat(data, options);
      } else {
        addMessageChat(data, options);
      }
    })

    socket.on('welcomeMessage', function(users){
      addMessageChat({
        msg: 'Bem vindo ' + name + '!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, { 
        right: false,
        log: true
      })
      generateGroup(users);
      $message.scrollTop($message.height());
    })

    socket.on('addPerson', (name, users) => {
      addMessageChat({  
        msg: name + ' acabou de entrar na sala!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, { 
        right: false,
        log: true
      })
      console.log(users);
      console.log($group);
      $group[0].removeChild($group[0].childNodes[1]);
      generateGroup(users);
      $message.scrollTop($message.height());
    })

    socket.on('typing', (msg) => {
      addTypingChat(msg);
      $message.scrollTop($message.height());
    })

    socket.on('stop typing', () => {
      addTypingChat('');
      $message.scrollTop($message.height());
    })

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

    $window.resize(function() {
      resize();
    });

    resize();
});