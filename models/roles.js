var mongoose = require("mongoose"),
  Schema = mongoose.Schema;
var roleSchema = new Schema({
  name: {type: String, index: true},
  permissions: {type: [String]}
});

module.exports = mongoose.model("Role", roleSchema);
