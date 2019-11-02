const Event = require("../models/events");

module.exports = {
  // creates a new event based on the user performing it and the action
  // if the user is a voter, then their name is not recorded
  // it is recorded if they are a delegate or admin, for accountability purposes
  // this function can be placed within any action to record an event
  saveEvent: function saveEvent({user, action, from, to}) {
    return new Promise(function(resolve, reject) {
      let event = new Event({
        timestamp: new Date(),
        action,
        user:
          user.role === "voter" ? user.role : `${user.username} (${user.role})`,
        from,
        to
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
    });
  }
};
