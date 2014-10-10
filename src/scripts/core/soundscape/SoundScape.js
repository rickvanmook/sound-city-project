var Q = require('../../libs/q'),
	SoundLoader = require('./SoundLoader'),
	PanoramaLoader = require('./PanoramaLoader'),
	AUDIO_FOLDER = 'audio/soundscape',
	PANORAMA_FOLDER = 'panorama/pan';

module.exports = function(id, locationPath) {


	var soundLoader = new SoundLoader(locationPath + AUDIO_FOLDER),
		panoramaLoader = new PanoramaLoader(locationPath + PANORAMA_FOLDER);

	this.id = id;

	this.getPanoramaAssets = function(){
		return panoramaLoader.getAssets();
	};


	this.init = function(skipLoRes) {

		var deferred = Q.defer();

		panoramaLoader.init(skipLoRes)
			.then(deferred.resolve)
			.progress(function(progress){
					deferred.notify(progress);
				});

		return deferred.promise;
	};

	this.show = function() {

		soundLoader.init()
			.then(function(){
				Q.all([
					soundLoader.show(),
					panoramaLoader.show()
				]);
			});
	};

	this.dispose = function() {

		soundLoader.dispose();
		panoramaLoader.dispose();
		soundLoader = null;
		panoramaLoader = null;
		id = null;
		var deferred = Q.defer();
		deferred.resolve();
		return deferred.promise;
	};


};