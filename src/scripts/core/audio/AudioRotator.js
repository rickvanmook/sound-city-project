var Q = require('../../libs/q'),
	audioContext = require('../../utils/centralAudioContext'),
	scpSignals = require('../scpSignals'),
	splitter = audioContext.createChannelSplitter(4),
	northGain = audioContext.createGain(),
	eastGain = audioContext.createGain(),
	southGain = audioContext.createGain(),
	westGain = audioContext.createGain(),
	isFlippedEastWest = false,
	isFlippedNorthSouth = false,
	degrees = 0,
	merger;

splitter.connect(northGain, 0);
splitter.connect(eastGain, 1);
splitter.connect(southGain, 2);
splitter.connect(westGain, 3);

exports.init = function(newMerger) {

	merger = newMerger;
	rotate(degrees);
};

exports.updateSource = function(newSource) {

	newSource.connect(splitter);
};

exports.getDegrees = function() {
	return degrees;
};

scpSignals.rotationUpdated.add(rotate);

function rotate(newDegrees) {

	degrees = newDegrees;

	var gains = getGain(degrees);

	northGain.gain.value = gains[0];
	eastGain.gain.value = gains[1];
	westGain.gain.value = gains[1];
	southGain.gain.value = gains[0];

	if(degrees > 90 && degrees < 270 && isFlippedEastWest) {
		restoreEastWest();
	} else if((degrees < 90 || degrees > 270) && !isFlippedEastWest) {
		flipEastWest();
	}

	if(degrees < 180 && !isFlippedNorthSouth) {
		flipNorthSouth();
	} else if(degrees > 180 && isFlippedNorthSouth) {
		restoreNorthSouth();
	}
}



function flipEastWest() {

	isFlippedEastWest = true;
	westGain.disconnect();
	eastGain.disconnect();

	// west / east
	westGain.connect(merger, 0, 0);
	eastGain.connect(merger, 0, 1);
}

function restoreEastWest() {

	isFlippedEastWest = false;
	westGain.disconnect();
	eastGain.disconnect();

	// east / west
	westGain.connect(merger, 0, 1);
	eastGain.connect(merger, 0, 0);
}

function flipNorthSouth() {

	isFlippedNorthSouth = true;
	northGain.disconnect();
	southGain.disconnect();
	northGain.connect(merger, 0, 0);
	southGain.connect(merger, 0, 1);
}

function restoreNorthSouth() {
	isFlippedNorthSouth = false;
	northGain.disconnect();
	southGain.disconnect();
	northGain.connect(merger, 0, 1);
	southGain.connect(merger, 0, 0);
}

function getGain(degrees) {

	var split = Math.round(degrees%180),
		average = Math.abs(split-90),
		percent = average/90,
		gainNS = Math.cos(percent * 0.5*Math.PI),
		gainEW = Math.cos((1.0 - percent) * 0.5*Math.PI);

	return [
		gainNS,
		gainEW
	];
}