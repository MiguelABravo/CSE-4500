/*
  Chat app, an app that allows users to create/join chat rooms.
  I was able to create this app by watching tutorials.
*/
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bcrypt = require('bcrypt');
const passport = require('passport');
const local_strat = require ('passport-local').Strategy;
const flash = require('express-flash');
const session = require ('express-session');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
const Sec = "abc";
app.use(flash());
app.use(session({
  secret: Sec,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const rooms = {};
const users = [];

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.get('/', (req, res) => {
  res.redirect('/index');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/create', (req, res) => {
  res.render('create.ejs');
});

app.post('/create', async (req, res) => {
  try {
    const hash_password = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      password: hash_password
    });
    res.redirect('/login');
  }
  catch{
    res.redirect('/create');
  }
  console.log(users)
});

app.get('/index', (req, res) => {
  res.render('index.ejs', {rooms: rooms});
});

app.get('/:room', (req, res) => {
  if ( rooms[req.params.room] == null)
  {
    return res.redirect('/index');
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
    return res.redirect('/index');
  }
  io.emit('new_room', req.body.room);
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


// passport stuff
initialize(passport, name => users.find(user => user.name === name))

function initialize(passport, getUserByName){
  const authenticateUser = async (name, password, done) => {
    const user = getUserByName(name);
    if (user == null)
      return done(null, false, { message: 'Error: User does not exist'});
    
    try{
      if (await bcrypt.compare(password, user.password))
        return done(null, user);
      else
        return done(null, false, {message: 'Error: Incorrect password'});
    }
    catch(e){
      return done (e);
    }

  }

  passport.use(new local_strat({usernameField: 'name'}, authenticateUser));
  passport.serializeUser((user, done) => { });
  passport.deserializeUser((id, done) => { });
}
