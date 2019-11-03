#! /user/bin/env node

var mongoose = require("mongoose");
var User = require("./models/users");
var Role = require("./models/roles");
var Ballot = require("./models/ballots");

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

var ballots = [
	{
		electorate: "Adelaide",
		above: ["Hemp Party", "Rain Party", "Other Hemp Party"],
		below: [
			{party: "Hemp Party", candidates: ["Michael Dab", "Michelle Doob"]},
			{party: "Rain Party", candidates: ["Chief Tomahawk", "Chris Lake"]},
			{party: "Other Hemp Party", candidates: ["Gregg Teeheytchsee", "Kate Trees"]}
		]
	}
];

var users = [
	{
		// _id: mongoose.Types.ObjectId("1"),
		username: "jack",
		password: "secret",
		displayName: "Jack",
		key: null,
		role: "voter",
		passwordID: "sd7f8g5s78d",
		active: true,
		email: "a1705815@student.adelaide.edu.au",
	},
	{
		// _id: mongoose.Types.ObjectId("2"),
		username: "jill",
		password: "birthday",
		displayName: "Jill",
		key: null,
		role: "hasVoted",
		passwordID: null,
		active: false,
		email: "hemp420@gmail.com",
	},
	{
		// _id: mongoose.Types.ObjectId("3"),
		username: "bob",
		password: "bobby300",
		displayName: "Bob",
		key: null,
		role: "voter",
		passwordID: "df76gf7s89e7",
		active: false,
		email: "a1705958@student.adelaide.edu.au",
	},
	{
		// _id: mongoose.Types.ObjectId("4"),
		username: "toucanboy",
		password: "qwertyuiop",
		displayName: "Larry",
		key: null,
		role: "voter",
		passwordID: "8s7dfg5hgd87",
		active: false,
		email: "a1704482@student.adelaide.edu.au",
	},
	{
		username: "delegate",
		password: "secret",
		displayName: "Delegate",
		key: null,
		role: "delegate",
		passwordID: null,
		active: true,
		email: "hempftw@gmail.com",
	},
	{
		username: "admin",
		password: "admin",
		displayName: "Admin",
		key: null,
		role: "admin",
		passwordID: null,
		active: true,
		email: "a1669249@student.adelaide.edu.au",
	},
	{
		username: "test",
		password: "sd768fg5ds87f6g5ds76fg",
		displayName: "TESTER",
		key: null,
		role: "voter",
		passwordID: "fd6gd78fgs7g",
		active: false,
		email: "a1621426@student.adelaide.edu.au",
	}
];

//the default roles
var roles = [
	{name: "voter", permissions: ["ballot"]},
	{name: "hasVoted", permissions: []},
	{name: "admin", permissions: ["createDelegate", "audit", "account"]},
	{name: "delegate", permissions: ["audit", "editBallot", "ballot", "countVotes"]}
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

function createBallot(details) {
	return new Promise(function(resolve, reject) {
		let ballot = new Ballot(details);
		ballot.save(function(err) {
			if (err) {
				reject(err);
				console.log(err);
				return;
			}
			resolve(ballot);
			console.log(ballot);
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

	ballots.forEach(ballot => {
		let promise = createBallot(ballot);
		promises.push(promise);
	});

	Promise.all(promises).then(cb);
}

seed(function() {
	//Finished
	mongoose.connection.close();
});
