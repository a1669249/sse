var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// events consist of a timestamp (when the action was taken), the user who performed it
// and the action they attempted to perform
var ballotSchema = new Schema({
  timestamp: {type: String, required: true, index: true},
  user: {type: String, required: true},
  action: {type: String, required: true}
});

module.exports = mongoose.model("Ballot", ballotSchema);