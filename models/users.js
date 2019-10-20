var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String,
  displayName: String,
  key: String
});

module.exports = mongoose.model('User', UserSchema);