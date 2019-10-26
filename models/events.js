var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var eventSchema = new Schema({
  timestamp: {type: String, required: true, index: true},
  user: {type: String, required: true},
  action: {type: String, required: true}
});

module.exports = mongoose.model("Event", eventSchema);
