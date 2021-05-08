const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: String,
    username: String,
    password: String
});

const User = mongoose.model('newuser', userSchema);
module.exports = User;