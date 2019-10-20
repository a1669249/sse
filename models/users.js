var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var permissions = require('../rbac/permissions');
var roles = Object.keys(permissions);

var userSchema = new Schema({
  username: {type: String, required: true, max: 100, index: true},
  password: {type: String, required: true, max: 100},
  displayName: {type: String, required: true, max: 100},
  key: {type: String},
  role: {type: [String], enum: roles, required: true}
});

module.exports = mongoose.model('User', userSchema);