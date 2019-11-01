var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// events consist of a timestamp (when the action was taken), the user who performed it
// and the action they attempted to perform
var ballotSchema = new Schema({
  electorate: {type: String, required: true, index: true},
  above: {type: [String], required: true},
  below: {type: [Object], required: true}
});

module.exports = mongoose.model("Ballot", ballotSchema);
