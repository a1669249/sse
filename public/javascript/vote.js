var aboveInput = new Map();
var belowInput = new Map();

$.get('ballot', function(ballot){
	pageSetup(ballot)
});

function pageSetup(ballot){
	var aboveLine = document.getElementById('aboveLine');
	var belowLine = document.getElementById('belowLine');
	var submitBtn = document.getElementById('submitBtn');

	document.getElementById('electorateName').innerHTML = ballot.electorate;

	ballot.above.forEach(function(party){
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');
		
		let inputCol = document.createElement('div');
		inputCol.classList.add('col');
		baseCol.appendChild(inputCol);

		let voteInput = document.createElement('select');
		for (var i = 0; i < ballot.above.length; i++) {
			voteInput.options.add(new Option(i+1,i));
		}
		inputCol.appendChild(voteInput);

		aboveInput.set(party, voteInput);

		let partyNameCol = document.createElement('div');
		partyNameCol.classList.add('col');
		partyNameCol.innerHTML = party;
		baseCol.appendChild(partyNameCol);

		aboveLine.appendChild(baseCol);
	});

	ballot.below.forEach(function(party){
		let baseCol = document.createElement('div');
		baseCol.classList.add('col');
		
		// let inputCol = document.createElement('div');
		// inputCol.classList.add('col');
		// baseCol.appendChild(inputCol);

		// let voteInput = document.createElement('select');
		// for (var i = ballot.above.length - 1; i >= 0; i--) {
		// 	voteInput.options.add(new Option(i+1,i));
		// }
		// inputCol.appendChild(voteInput);

		// let partyNameCol = document.createElement('div');
		// partyNameCol.classList.add('col');
		// partyNameCol.innerHTML = party;
		// baseCol.appendChild(partyNameCol);

		belowLine.appendChild(baseCol);
	});

	submitBtn.addEventListener('click', submitVote);
}

function submitVote(){

}

// function createPartyColumn(party){

// }