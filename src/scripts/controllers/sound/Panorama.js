var Q = require('../../libs/q'),
	analytics = require('../../utils/analytics'),
	scpSignals = require('../../core/scpSignals'),
	domSelector = require('../../utils/domSelector'),
	PanoramaViewer = require('./panorama/PanoramaViewer'),
	PanoramaRotator = require('./panorama/PanoramaRotator'),
	soundScapeManager = require('../../core/SoundScapeManager');

module.exports = function(el) {

	var currentViewer = new PanoramaViewer(el),
		rotator = new PanoramaRotator(el),
		isGoingRight,
		previousViewer;

	this.init = function(){

		var currentSoundScape = soundScapeManager.getCurrentSoundScape(),
			panoramaAssets = currentSoundScape.getPanoramaAssets();

		scpSignals.locationDataUpdated.add(onLocationDataUpdated);

		rotator.init();
		currentViewer.totalWidthUpdated.add(onTotalWidthUpdated);
		scpSignals.panoramaUpdated.add(onPanoramaUpdated);
		currentViewer.init(panoramaAssets);
	};

	function onTotalWidthUpdated(newTotalWidth) {
		rotator.resize(newTotalWidth);
	}

	function onLocationDataUpdated(data, newIsGoingRight) {

		isGoingRight = newIsGoingRight;
	}


	function onPanoramaUpdated(panoramaAssets, isUpdate) {

		if(isUpdate) {

			currentViewer.update(panoramaAssets);

		} else {

			previousViewer = currentViewer;
			currentViewer = new PanoramaViewer(el);

			currentViewer.totalWidthUpdated.add(onTotalWidthUpdated);
			currentViewer.init(panoramaAssets, isGoingRight);

			transitionToNewViewer();

			analytics.trackSoundView();
		}
	}

	function transitionToNewViewer() {

		var directionMethod = isGoingRight ? currentViewer.goCenter : previousViewer.goRight;

		return directionMethod()
			.then(previousViewer.dispose)
			.then(function(){
				previousViewer = null;
			});
	}

	this.dispose = function(){

		rotator.dispose();
		currentViewer.dispose();
		scpSignals.panoramaUpdated.remove(onPanoramaUpdated);

		rotator = null;
		currentViewer = null;
	};

};