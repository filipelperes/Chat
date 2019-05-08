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
    var $group = $('#group');
    var $butt = $('#butt');
    
    const setUser = () => {
      name = $inputName.val();
      socket.emit('addPerson', name)
      //setGroup()
      //addUserGroup(name);
      $modal.modal('hide');
    }

    const sendMessage = (data) => {
      var msg = data.time + " " + data.name + ": " + data.msg;
      addMessageChat(msg);
    }

    const addMessageChat = (msg) => {
      $message.append($('<p>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
    }

    const setGroup = (group) => {
      var list = document.createElement('ul');

      console.log(group)

      for(var i = 0; i < group.length; i++) {
          var item = document.createElement('li');

          item.appendChild(document.createTextNode(group[i]));

          list.appendChild(item);
      }

      console.log(list)

      $group.append(list);
    }

    const addUserGroup = (name) => {
      $group.append($('<p>').text(name));
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

    const removeUserMessage = (msg) => {
      $notify.append($('<h1>').text(msg));
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
      sendMessage(data);
      socket.emit('chat message', data);
      $m.val('');
      return false;
    });

    $formMsg.on('input', () => {
      updateTyping();
    })

    socket.on('chat message', (msg) => {
      addMessageChat(msg);
    })

    socket.on('welcomeMessage', (users) => {
      $message.append($('<p>').text('bem vindo ' + name + '!'));
      console.log(users)
      setGroup(users);
      window.scrollTo(0, document.body.scrollHeight);
    })

    socket.on('addPerson', (name, users) => {
      $message.append($('<p>').text(name + ' acabou de entrar na sala!'));
      console.log(users);
      $group[0].removeChild($group[0].childNodes[1]);
      setGroup(users);
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
      removeUserMessage(name + ' saiu da sala!')
      $group[0].removeChild($group[0].childNodes[1]);
      setGroup(users);
      window.scrollTo(0, document.body.scrollHeight);
    })
  });