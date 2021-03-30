const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
const rooms = {};

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.get('/', (req, res) => {
  res.render('index', {rooms: rooms});
});

app.get('/:room', (req, res) => {
  if ( rooms[req.params.room] == null)
  {
    return res.redirect('/');
  }
  res.render('room', {room_name: req.params.room});
});

app.post('/room', (req, res) => {
  if ( rooms[req.body.room] == null)
  {
    rooms[req.body.room] = { users: {} };
    res.redirect(req.body.room);
  }
  else
  {
    return res.redirect('/');
  }
  io.broadcast.emit('new_room', req.body.room);
});

/*users message broadcasted to everyone*/
io.on('connection', (socket) => {
  //new user code is not my code, I will change it when I add google authentication
  socket.on('new-user', (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).broadcast.emit('user-connected', name);
  });
  socket.on('send_message', (room, msg) => {
    socket.to(room).broadcast.emit("user_message", {msg: msg, name: rooms[room].users[socket.id] });
  });
  // I'm going to change disconnect code
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

// I'm going to change getUserRooms code
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}