var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// roles consist of a name ("voter", "delegate") and a list of permissions they are allowed to perform
var roleSchema = new Schema({
  name: {type: String, unique: true, index: true},
  permissions: {type: [String]}
});

module.exports = mongoose.model("Role", roleSchema);
