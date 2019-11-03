var savedBallot;
var partyList = document.getElementById('partyList');
var candidateLists = document.getElementById('candidateLists');
var partyCount = 0; // Keeps count of parties so UI ID's don't conflict
var inputs = new Map();

$.get('/api/ballot', function(ballot){
	savedBallot = ballot;
	pageSetup(ballot);
});

function pageSetup(ballot){
	var saveBtn = document.getElementById('saveBtn');

	ballot.below.forEach(function(party){
		let inputTemp = {};

		// Party name list item
		let partyBox = document.createElement('A');
		partyBox.classList.add('list-group-item','list-group-item-action');
		partyBox.id = `list-${partyCount}-list`;
		partyBox.setAttribute('data-toggle','list');
		partyBox.href = `#list-${partyCount}`;

		// Text input for party name
		let partyName = document.createElement('input');
		partyName.id = `list-${partyCount}-name`;
		partyName.setAttribute('type','text');
		partyName.classList.add('w-75');
		partyName.value = party.party;
		partyBox.appendChild(partyName);

		// Save input for later use
		inputTemp.partyName = partyName;

		// Remove Party button
		let removeParty = document.createElement('button');
		removeParty.setAttribute('title','Remove Party');
		removeParty.setAttribute('data-toggle','tooltip');
		removeParty.setAttribute('data-placement','top');
		removeParty.classList.add('close');
		removeParty.addEventListener('click',removePartyFromBallot)
		partyBox.appendChild(removeParty);

		// 'X' icon
		let x = document.createElement('span');
		x.innerHTML = '&times;';
		removeParty.appendChild(x);

		// List of candidates for this party
		let tabPane = document.createElement('div');
		tabPane.classList.add('tab-pane','list-group','mx-auto');
		tabPane.id = `list-${partyCount}`;
		tabPane.setAttribute('role','tabpanel');
		candidateLists.appendChild(tabPane);

		// Set up candidate array for input saving
		inputTemp.candidates = [];

		for (var i = 0; i < party.candidates.length; i++){
			let canBox = document.createElement('A');
			canBox.classList.add('list-group-item');
			tabPane.appendChild(canBox);

			// Text input for Candidate name
			let canName = document.createElement('input');
			canName.setAttribute('type','text');
			canName.classList.add('w-75');
			canName.value = party.candidates[i];
			canBox.appendChild(canName);

			// Save input for later use
			inputTemp.candidates.push(canName);

			// Remove Candidate button
			let removeCan = document.createElement('button');
			removeCan.setAttribute('title','Remove Candidate');
			removeCan.setAttribute('data-toggle','tooltip');
			removeCan.setAttribute('data-placement','top');
			removeCan.classList.add('close');
			removeCan.addEventListener('click', removeCandidate)
			canBox.appendChild(removeCan);

			// 'X' icon
			x = document.createElement('span');
			x.innerHTML = '&times;';
			removeCan.appendChild(x);
		}

		// Add Candidate Button
		let addCan = document.createElement('A');
		addCan.classList.add('list-group-item','list-group-item-action');
		addCan.style.cursor = 'pointer';
		addCan.setAttribute('title','Add Candidate');
		addCan.setAttribute('data-toggle','tooltip');
		addCan.setAttribute('data-placement','top');
		addCan.addEventListener('click',addCandidate);
		tabPane.appendChild(addCan);
		
		// '+' icon
		x = document.createElement('span');
		x.innerHTML = '&#43;';
		addCan.appendChild(x);

		inputs.set(`list-${partyCount}-list`, inputTemp);
		partyList.appendChild(partyBox);
		partyCount++;
	});

	// Add Party Button
	let addParty = document.createElement('A');
	addParty.classList.add('list-group-item','list-group-item-action');
	addParty.style.cursor = 'pointer';
	addParty.setAttribute('title','Add Party');
	addParty.setAttribute('data-toggle','tooltip');
	addParty.setAttribute('data-placement','top');
	addParty.addEventListener('click',addPartyToBallot);
	partyList.appendChild(addParty);
	
	// '+' icon
	let x = document.createElement('span');
	x.innerHTML = '&#43;';
	addParty.appendChild(x);

	// Have first party as active and show it's candidates
	if (partyList.firstChild)
		partyList.firstChild.classList.add('active');
	if (candidateLists.firstChild)
		candidateLists.firstChild.classList.add('show','active');

	$('[data-toggle="tooltip"]').tooltip();
	saveBtn.addEventListener('click', saveBallot);
}

function removePartyFromBallot(e){
	let party = e.target.parentNode.parentNode;
	let cansId = party.getAttribute('href').slice(1);
	let cans = document.getElementById(cansId);
	let tooltipId = e.target.parentNode.getAttribute('aria-describedby');
	let tooltip = document.getElementById(tooltipId);

	inputs.delete(cansId+'-list');

	tooltip.remove();
	cans.remove();
	party.remove();
}

function addPartyToBallot(){
	let inputTemp = {};

	let partyBox = document.createElement('A');
	partyBox.classList.add('list-group-item','list-group-item-action');
	partyBox.id = `list-${partyCount}-list`;
	partyBox.setAttribute('data-toggle','list');
	partyBox.href = `#list-${partyCount}`;

	// Text input for party name
	let partyName = document.createElement('input');
	partyName.id = `list-${partyCount}-name`;
	partyName.setAttribute('type','text');
	partyName.classList.add('w-75');
	partyName.value = '*Party Name*';
	partyBox.appendChild(partyName);

	// Save input for later use
	inputTemp.partyName = partyName;

	// Remove Party button
	let removeParty = document.createElement('button');
	removeParty.setAttribute('title','Remove Party');
	removeParty.setAttribute('data-toggle','tooltip');
	removeParty.setAttribute('data-placement','top');
	removeParty.classList.add('close');
	removeParty.addEventListener('click',removePartyFromBallot)
	partyBox.appendChild(removeParty);

	// 'X' icon
	let x = document.createElement('span');
	x.innerHTML = '&times;';
	removeParty.appendChild(x);

	// List of candidates for this party
	let tabPane = document.createElement('div');
	tabPane.classList.add('tab-pane','list-group','mx-auto');
	tabPane.id = `list-${partyCount}`;
	tabPane.setAttribute('role','tabpanel');
	candidateLists.appendChild(tabPane);

	// Add Candidate Button
	let addCan = document.createElement('A');
	addCan.classList.add('list-group-item','list-group-item-action');
	addCan.style.cursor = 'pointer';
	addCan.setAttribute('title','Add Candidate');
	addCan.setAttribute('data-toggle','tooltip');
	addCan.setAttribute('data-placement','top');
	addCan.addEventListener('click',addCandidate);
	tabPane.appendChild(addCan);
	
	// '+' icon
	x = document.createElement('span');
	x.innerHTML = '&#43;';
	addCan.appendChild(x);

	inputTemp.candidates = [];
	inputs.set(`list-${partyCount}-list`, inputTemp);

	partyCount++;
	partyList.insertBefore(partyBox,partyList.lastChild);
	$('[data-toggle="tooltip"]').tooltip();
}

function removeCandidate(e){
	let can = e.target.parentNode.parentNode;
	let tooltipId = e.target.parentNode.getAttribute('aria-describedby');
	let tooltip = document.getElementById(tooltipId);

	let input = inputs.get(can.parentNode.id+'-list');
	input.candidates = input.candidates.filter(inp => inp != can.firstChild);

	tooltip.remove();
	can.remove();
}

function addCandidate(e){
	let tabPane = e.target.parentNode;

	if (tabPane.innerHTML == "<span>+</span>"){
		tabPane = tabPane.parentNode;
	}

	let canBox = document.createElement('A');
	canBox.classList.add('list-group-item');
	
	// Text input for Candidate name
	let canName = document.createElement('input');
	canName.setAttribute('type','text');
	canName.classList.add('w-75');
	canName.value = '*Candidate Name*';
	canBox.appendChild(canName);

	// Remove Party button
	let removeCan = document.createElement('button');
	removeCan.setAttribute('title','Remove Candidate');
	removeCan.setAttribute('data-toggle','tooltip');
	removeCan.setAttribute('data-placement','top');
	removeCan.classList.add('close');
	removeCan.addEventListener('click', removeCandidate)
	canBox.appendChild(removeCan);

	// 'X' icon
	x = document.createElement('span');
	x.innerHTML = '&times;';
	removeCan.appendChild(x);

	let inMap = inputs.get(tabPane.id+'-list');
	inMap.candidates.push(canName)

	tabPane.insertBefore(canBox,tabPane.lastChild);
	$('[data-toggle="tooltip"]').tooltip();
}

function saveBallot(){
	if (
		confirm("Are you sure you want to save your ballot?\n Click 'OK' to submit or 'Cancel' to revise.")
	){
		savedBallot.above = [];
		savedBallot.below = [];

		inputs.forEach(function(inputs, key, map){
			var pName = inputs.partyName.value;
			var canNames = [];
			for (var i = 0; i < inputs.candidates.length; i++){
				canNames.push(inputs.candidates[i].value);
			}
			savedBallot.above.push(pName);
			savedBallot.below.push({party:pName, candidates:canNames});
		});

		// Send vote to server
		$.post('/api/ballot',savedBallot);
	}
}