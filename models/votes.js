//The original vote will look like this
//But we must encrypt the data before we save it to the db
//NOTE: empty boxes may be represented as blank elements in an array or null values
//NOTE: trailing commas in an array are ignored and dont produce a null value
//{ id: 1, vote: {above: [1, 2, 3, 4,,, 2, 1], below:[null, null,]}}
//Firstly we stringify the vote object
//{ id: 1, vote: "{\"above\":[1,2,3,4,null,null,2,1],\"below\":[null,null]}"}
//Then we convert that to a base64 string
//{ id: 1, vote: "e1wiYWJvdmVcIjpbMSwyLDMsNCxudWxsLG51bGwsMiwxXSxcImJlbG93XCI6W251bGwsbnVsbF19"}
//Then we encrypt that base64 string with bcrypt
// { id: 1, vote: "/aR0kxvjsasO2ZNpUPcUzKSN28TaTm4DP2bw2DqZDzJl2RQCwzuIrfFJdHmrOOfj6hxpzlwmYRg4N2E5JlOxmmzVJIBPyKYWOrGBra92X8FpG7W5r8ilrOfw5IRojcCj"}
//To count the votes, the algorithm must reverse this process to get the plain votes

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var voteSchema = new Schema({
  above: {type: [String], required: true},
  below: {type: [String], required: true},
});

module.exports = mongoose.model("Vote", voteSchema);
