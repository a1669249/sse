var mongoose = require("mongoose");
var Event = require("../models/events");

var mongoDB =
  "mongodb+srv://sseproject:sseproject@sseproject-cosb2.mongodb.net/myvote?retryWrites=true&w=majority";
mongoose.connect(
  mongoDB,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

function saveEvent({user, action}) {
  let event = new Event({
    timestamp: new Date(),
    action,
    user: user.role === "voter" ? user.role : `${user.username} (${user.role})`
  });
  event.save(function(err) {
    if (err) {
      reject(err);
      console.log(err);
      return;
    }
    resolve(event);
    console.log(event);
  });
}

module.exports = saveEvent;
