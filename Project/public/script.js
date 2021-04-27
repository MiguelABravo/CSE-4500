const socket = io('http://localhost:3000')

const sendf = document.getElementById('send');
const text = document.getElementById('message_input');
const mes = document.getElementById('message');
const roomcon = document.getElementById('roomc');

if (sendf != null) 
{
    socket.emit('new-user', room_name, userN);

    /*user message sent to client*/
    sendf.addEventListener('submit', ref => {
        ref.preventDefault();
        const msg = text.value;
        socket.emit('send_message', room_name, msg);
        Message(`You: ${msg}`);
        text.value = '';
        });
}

socket.on('user_message', data => {
    Message(`${data.name}: ${data.msg}`);
    });

/*adds each message to the client*/
function Message(msg){
    const mes_ele = document.createElement('div');
    mes_ele.innerText = msg;
    mes.append(mes_ele);
    };

socket.on('new_room', room => {
    const roome = document.createElement('div');
    roome.innerText = room;
    const rooml = document.createElement('a');
    rooml.href = `/${room}`;
    rooml.innerText = 'join';
    roomcon.append(roome);
    roomcon.append(rooml);
});

socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
  });
  
  socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
  });
