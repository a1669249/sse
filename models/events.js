var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// events consist of a timestamp (when the action was taken), the user who performed it
// and the action they attempted to perform
var eventSchema = new Schema({
  timestamp: {type: String, required: true, index: true},
  user: {type: String, required: true},
  action: {type: String, required: true},
  from: {type: Object},
  to: {type: Object}
});

module.exports = mongoose.model("Event", eventSchema);
