#! /user/bin/env node

var mongoose = require("mongoose");
var User = require("./models/users");
var Role = require("./models/roles");

//Set up default mongoose connection
//Format = mongodb+srv://<MongoDBUser>:<UserPassword>@<ClusterName>-cosb2.mongodb.net/test?retryWrites=true&w=majority
var mongoDB =
  "mongodb+srv://sseproject:sseproject@sseproject-cosb2.mongodb.net/myvote?retryWrites=true&w=majority";
mongoose.connect(
  mongoDB,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var users = [
  {
    // _id: mongoose.Types.ObjectId("1"),
    username: "jack",
    password: "secret",
    displayName: "Jack",
    key: null,
    role: "voter"
  },
  {
    // _id: mongoose.Types.ObjectId("2"),
    username: "jill",
    password: "birthday",
    displayName: "Jill",
    key: null,
    role: "hasVoted"
  },
  {
    username: "delegate",
    password: "secret",
    displayName: "Delegate",
    key: null,
    role: "delegate"
  }
];

var roles = [
  {name: "voter", permissions: ["vote"]},
  {name: "hasVoted", permissions: []},
  {name: "admin", permissions: ["createDelegate", "audit"]},
  {name: "delegate", permissions: ["audit"]}
];

function createUser(details) {
  return new Promise(function(resolve, reject) {
    let user = new User(details);
    user.save(function(err) {
      if (err) {
        reject(err);
        console.log(err);
        return;
      }
      resolve(user);
      console.log(user);
    });
  });
}

function createRole(details) {
  return new Promise(function(resolve, reject) {
    let role = new Role(details);
    role.save(function(err) {
      if (err) {
        reject(err);
        console.log(err);
        return;
      }
      resolve(role);
      console.log(role);
    });
  });
}

function seed(cb) {
  let promises = [];
  users.forEach(user => {
    let promise = createUser(user);
    promises.push(promise);
  });

  roles.forEach(role => {
    let promise = createRole(role);
    promises.push(promise);
  });
  Promise.all(promises).then(cb);
}

seed(function() {
  //Finished
  mongoose.connection.close();
});
