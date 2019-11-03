/*
	Populates the vote.ejs UI with the ballot retrieved from the server.
	Handles submitting the vote to the server.
	Input can be seen when accessing /api/vote route.
	Output on successful vote is the /api/sausage route/page.
*/ 

var aboveInput = new Map();
var belowInput = new Map();
var totalCandidates = 0;
var totalParties = 0;

$.get('/api/ballot', function(ballot){
	pageSetup(ballot)
});

function pageSetup(ballot){
	var aboveLine = document.getElementById('aboveLine');
	var belowLine = document.getElementById('belowLine');
	var submitBtn = document.getElementById('submitBtn');

	// Set electorate name in the HTML
	document.getElementById('electorateName').innerHTML = ballot.electorate;

	totalParties = ballot.above.length;
	ballot.above.forEach(function(party){
		// Create a base for the party
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');

		// Create a div for the vote input
		let inputCol = document.createElement('div');
		inputCol.classList.add('col-4','mb-1');
		baseCol.appendChild(inputCol);

		// The vote input for a party
		let voteInput = document.createElement('select');
		voteInput.classList.add('custom-select');
		voteInput.style.width = '60px';
		voteInput.options.add(new Option('-',0));
		// Set the input options
		for (var i = 0; i < ballot.above.length; i++) {
			voteInput.options.add(new Option(i+1,i+1));
		}
		inputCol.appendChild(voteInput);

		// Div for party name
		let partyNameCol = document.createElement('div');
		partyNameCol.classList.add('col');
		partyNameCol.innerHTML = party;
		baseCol.appendChild(partyNameCol);

		// Append to the HTML so it shows
		aboveLine.appendChild(baseCol);
		// Save the vote input for later so it can be read and submitted
		aboveInput.set(party, voteInput);
	});

	// Count total candidates
	for (var i = 0; i < ballot.below.length; i++){
		totalCandidates += ballot.below[i].candidates.length;
	}

	ballot.below.forEach(function(party){
		// Column for whole party
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');

		// Sub-column for party name
		let partyNameCol = document.createElement('div');
		partyNameCol.classList.add('col','mb-1');
		partyNameCol.innerHTML = party.party;
		baseCol.appendChild(partyNameCol);

		for (var i = 0; i < party.candidates.length; i++){
			// Sub-column per candidate
			let canCol = document.createElement('div');
			canCol.classList.add('row','mx-auto','mb-1');
			baseCol.appendChild(canCol);

			// Sub-sub-column for vote input
			let inputCol = document.createElement('div');
			inputCol.classList.add('col-2');
			canCol.appendChild(inputCol);

			// Input dropdown
			let voteInput = document.createElement('select');
			voteInput.classList.add('custom-select');
			voteInput.style.width = '60px';
			voteInput.options.add(new Option('-',0));
			// Set input options
			for (var j = 0; j < totalCandidates; j++) {
				voteInput.options.add(new Option(j+1,j+1));
			}
			inputCol.appendChild(voteInput);

			// Sub-sub-column for candidate name
			let canNameCol = document.createElement('div');
			canNameCol.classList.add('col','text-left');
			canNameCol.innerHTML = party.candidates[i];
			canCol.appendChild(canNameCol);

			// Save input for later read and submit
			belowInput.set(party.candidates[i], voteInput);
		}

		// Append to HTML so it appears
		belowLine.appendChild(baseCol);
	});

	// Make the "submit" button submit the vote
	submitBtn.addEventListener('click', submitVote);
}

// Gathers vote inputs and submits to the server
function submitVote(){
	if (
	confirm("Once your vote is submitted it cannot be changed.\n Click 'OK' to submit your vote or 'Cancel' to revise.")
	){
		var vote = {
			above: new Array(totalParties),
			below: new Array(totalCandidates)
		};

		// Go through all the above the line inputs and save the selections
		// as a "vote". Input tested to be a valid number.
		aboveInput.forEach(function(input, key, map){
			if (!isNaN(input.value) && input.value > 0 && input.value < totalParties)
				vote.above[input.value-1] = key;
		});

		// Go through all the below the line inputs and save the selections
		// as a "vote". Input tested to be a valid number.
		belowInput.forEach(function(input, key, map){
			if (!isNaN(input.value) && input.value > 0 && input.value < totalCandidates)
				vote.below[input.value-1] = key;
		});

		// Send vote to server
		$.post('/api/vote',vote).done(function(data) {
			document.location = data.redirect;
		});
	}
}