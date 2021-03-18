const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

/*users message broadcasted everyone*/
io.on('connection', (socket) => {
  socket.on('send_message', msg => {
    socket.broadcast.emit("user_message", msg);
  });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
  });
