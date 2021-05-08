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
const methodOverride = require('method-override');
const mongoose = require('mongoose');

//mongodb stuff
const User = require('./models/user');
mongoose.connect('mongodb://localhost/chatapp',{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to db'));

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
app.use(methodOverride('_method'));
const rooms = { };
const users = [];

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index', { rooms: rooms, name: req.user.name });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/create', checkNotAuthenticated, (req, res) => {
  res.render('create.ejs');
});

app.post('/create', checkNotAuthenticated, async (req, res) => {
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

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

app.get('/index', checkAuthenticated, (req, res) => {
  res.render('index.ejs', {rooms: rooms, name: req.user.name});
});

app.get('/:room', checkAuthenticated, (req, res) => {
  if ( rooms[req.params.room] == null)
  {
    return res.redirect('/index');
  }
  res.render('room', {room_name: req.params.room, userN: req.user.name});
});

app.post('/room', checkAuthenticated, (req, res) => {
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
  //new user code is not my code, I didn't have to have change after all since i am using passport
  socket.on('new-user', (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).broadcast.emit('user-connected', name);
  });
  socket.on('send_message', (room, msg) => {
    socket.to(room).broadcast.emit("user_message", {msg: msg, name: rooms[room].users[socket.id] });
  });
  // not my code, I didn't have to have change after all since i am using passport
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

// not my code, I didn't have to have change after all since i am using passport
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}


// passport stuff
initialize(passport, name => users.find(user => user.name === name), id => users.find(user => user.id === id))

function initialize(passport, getUserByName, getUserById){
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
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => { return done(null, getUserById(id)) });
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

module.exports = initialize;
