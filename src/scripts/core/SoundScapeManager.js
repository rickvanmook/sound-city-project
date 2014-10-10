var scpSignals = require('./scpSignals'),
	menu = require('./menu'),
	isInitialized = false,
	SoundScape = require('./soundscape/SoundScape'),
	Q = require('../libs/q'),
	currentSoundScape = {dispose:function(){}};

exports.getCurrentSoundScape = function() {
	return currentSoundScape;
};

exports.updateLocation = function(newLocation){

	if(isInitialized) {
		return updateLocation(newLocation);
	} else {
		return init(newLocation);
	}
};

function init(newLocation) {

	var deferred = Q.defer();
	isInitialized = true;

	currentSoundScape.dispose();
	currentSoundScape = new SoundScape(newLocation.id, newLocation.path);

	currentSoundScape.init(true)
		.then(function(){
			currentSoundScape.show();
			deferred.resolve();
		}, noop,
		function(progress){
			scpSignals.loadProgressUpdated.dispatch(progress);
			menu.setPageProgress(progress);
		});

	return deferred.promise;
}

function updateLocation(newLocation) {

	var deferred = Q.defer();

	currentSoundScape.dispose();
	currentSoundScape = new SoundScape(newLocation.id, newLocation.path);

	currentSoundScape.init()
		.then(function(){
			deferred.resolve();
			currentSoundScape.show();
		});

	return deferred.promise;
}