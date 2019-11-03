var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, unique: true, required: true, max: 100, index: true},
  password: {type: String, required: true, max: 100},
  displayName: {type: String, required: true, max: 100},
  key: {type: String},
  role: {type: String, required: true}
});

module.exports = mongoose.model("User", userSchema);
