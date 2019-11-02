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

	document.getElementById('electorateName').innerHTML = ballot.electorate;

	totalParties = ballot.above.length;
	ballot.above.forEach(function(party){
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');
		
		let inputCol = document.createElement('div');
		inputCol.classList.add('col-4','mb-1');
		baseCol.appendChild(inputCol);

		let voteInput = document.createElement('select');
		voteInput.classList.add('custom-select');
		voteInput.style.width = '60px';
		voteInput.options.add(new Option('-',0));
		for (var i = 0; i < ballot.above.length; i++) {
			voteInput.options.add(new Option(i+1,i+1));
		}
		inputCol.appendChild(voteInput);

		let partyNameCol = document.createElement('div');
		partyNameCol.classList.add('col');
		partyNameCol.innerHTML = party;
		baseCol.appendChild(partyNameCol);

		aboveLine.appendChild(baseCol);
		aboveInput.set(party, voteInput);
	});

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
			for (var j = 0; j < totalCandidates; j++) {
				voteInput.options.add(new Option(j+1,j+1));
			}
			inputCol.appendChild(voteInput);

			// Sub-sub-column for candidate name
			let canNameCol = document.createElement('div');
			canNameCol.classList.add('col','text-left');
			canNameCol.innerHTML = party.candidates[i];
			canCol.appendChild(canNameCol);

			belowInput.set(party.candidates[i], voteInput);
		}

		belowLine.appendChild(baseCol);
	});

	submitBtn.addEventListener('click', submitVote);
}

function submitVote(){
	if (
	confirm("Once your vote is submitted it cannot be changed.\n Click 'OK' to submit your vote or 'Cancel' to revise.")
	){
		var vote = {
			above: new Array(totalParties),
			below: new Array(totalCandidates)
		};

		aboveInput.forEach(function(input, key, map){
			if (!isNaN(input.value) && input.value > 0 && input.value < totalParties)
				vote.above[input.value-1] = key;
		});

		belowInput.forEach(function(input, key, map){
			if (!isNaN(input.value) && input.value > 0 && input.value < totalCandidates)
				vote.below[input.value-1] = key;
		});

		// Send vote to server
		$.post('/api/vote',vote);
	}
}