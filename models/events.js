var mongoose = require("mongoose"),
  Schema = mongoose.Schema;
var permissions = require("../rbac/permissions");
var roles = Object.keys(permissions);

var eventSchema = new Schema({
  timestamp: {type: String, required: true},
  user: {type: String, required: true},
  action: {type: [String], required: true, index: true}
});

module.exports = mongoose.model("Event", eventSchema);
