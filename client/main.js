var moment = moment();

$(function () {
    var TYPING_TIMER_LENGTH = 400; // ms
    
    var socket = io();

    var lastTypingTime;

    var name = '';
    var typing = false;

    var $modal = $('#myModal');
    var $btnName = $('#btnName');
    var $formMsg = $('#formMsg');
    var $formUser = $('#formUser');
    var $inputName = $('#inputName');
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

    const resize = () => {
      $cardChat.height($window.height() - 50 );
      $cardBody.height($window.height() - 50 );     
    }

    const setUser = () => {
      name = $inputName.val();
      socket.emit('addPerson', name);
      $modal.modal('hide');
    }

    const addMessageChat = (data, options) => {
      if(options.log === true){
        var msg = data.msg;
      } else {
        var msg = data.name + ": " + data.msg;
      }

      if(options.right === true){
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
              <span class="time_date">' + data.time + '</span></div>\
          </div>\
        </div>\
        '))
      }
      window.scrollTo(0, document.body.scrollHeight);
    }

    const addGroupChat = (list) => {
      $group.append(list);
    }

    const generateGroup = (group) => {
      var list = document.createElement('ul');
      list.setAttribute("class", "list-group list-group-flush");

      for(var i = 0; i < group.length; i++) {
          var item = document.createElement('li');
          item.setAttribute("class", "list-group-item");

          item.appendChild(document.createTextNode(group[i]));

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
        socket.emit('typing', name + " está digitando!");
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

    const removeUserGroup = () => {

    }

    $modal.modal({
      backdrop: 'static',
      keyboard: false,
      focus: false,
      show: true
    });

    $formUser.submit(() => {
      setUser();
      return false;
    });

    $btnName.on('click', () => {
      setUser();
    })

    $formMsg.submit(() => {
      var msg = $m.val();
      var data = {
        time: moment.get('hour') + ":" + moment.get('minute'),
        msg: msg,
        name: name
      }
      console.log(data)
      addMessageChat(data, {
        right: true,
        log: false
      });
      socket.emit('chat message', data);
      $m.val('');
      return false;
    });

    $formMsg.on('input', () => {
      updateTyping();
    })

    socket.on('chat message', (data) => {
      addMessageChat(data, {
        right: false,
        log: false
      });
    })

    socket.on('welcomeMessage', (users) => {
      addMessageChat({  
        msg: 'Bem vindo ' + name + '!',
        time: moment.get('hour') + ":" + moment.get('minute')
      }, { 
        right: false,
        log: true
      })
      generateGroup(users);
      window.scrollTo(0, document.body.scrollHeight);
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
      window.scrollTo(0, document.body.scrollHeight);
    })

    socket.on('typing', (msg) => {
      addTypingChat(msg);
      window.scrollTo(0, document.body.scrollHeight);
    })

    socket.on('stop typing', () => {
      addTypingChat('');
      window.scrollTo(0, document.body.scrollHeight);
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
      window.scrollTo(0, document.body.scrollHeight);
    })

    $window.resize(function() {
      resize();
    });

    resize();
  });