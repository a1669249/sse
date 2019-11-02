var aboveInput = new Map();
var belowInput = new Map();

$.get('ballot', function(ballot){
	pageSetup(ballot)
});

function pageSetup(ballot){
	var aboveLine = document.getElementById('aboveLine');
	var belowLine = document.getElementById('belowLine');
	var submitBtn = document.getElementById('submitBtn');
	var totalCandidates = 0;

	document.getElementById('electorateName').innerHTML = ballot.electorate;

	ballot.above.forEach(function(party){
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');
		
		let inputCol = document.createElement('div');
		inputCol.classList.add('col');
		baseCol.appendChild(inputCol);

		let voteInput = document.createElement('select');
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
		partyNameCol.classList.add('col');
		partyNameCol.innerHTML = party.party;
		baseCol.appendChild(partyNameCol);
		
		for (var i = 0; i < party.candidates.length; i++){
			// Sub-column per candidate
			let canCol = document.createElement('div');
			canCol.classList.add('col');
			baseCol.appendChild(canCol);

			// Sub-sub-column for vote input
			let inputCol = document.createElement('div');
			inputCol.classList.add('col');
			canCol.appendChild(inputCol);

			// Input dropdown
			let voteInput = document.createElement('select');
			voteInput.options.add(new Option('-',0));
			for (var j = 0; j < totalCandidates; j++) {
				voteInput.options.add(new Option(j+1,j+1));
			}
			inputCol.appendChild(voteInput);

			// Sub-sub-column for candidate name
			let canNameCol = document.createElement('div');
			canNameCol.classList.add('col');
			canNameCol.innerHTML = party.candidates[i];
			canCol.appendChild(canNameCol);

			// belowInput.set(party.candidates[i], voteInput);
		}

		belowLine.appendChild(baseCol);
	});

	submitBtn.addEventListener('click', submitVote);
}

function submitVote(){

}

// function createPartyColumn(party){

// }