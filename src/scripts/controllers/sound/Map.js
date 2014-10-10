var Q = require('../../libs/q'),
	domSelector = require('../../utils/domSelector'),
	googleMap = require('../../core/googleMap'),
	dataManager = require('../../core/DataManager'),
	scpSignals = require('../../core/scpSignals'),
	unPrefixedTransform  = require('../../utils/unPrefixedTransform');


module.exports = function(el) {

	var parentEl = el.parentElement,
		zoomInEl,
		zoomOutEl,
		locatorEl,
		currentLocation;

	this.init = function(){

		var deferred = Q.defer();
		googleMap.show(el);

		zoomInEl = domSelector.first(parentEl, 'sound-map-control--in');
		zoomOutEl = domSelector.first(parentEl, 'sound-map-control--out');
		locatorEl = domSelector.first(parentEl, 'sound-map-control--locator');

		zoomInEl.addEventListener('click', onZoomInClick, false);
		zoomOutEl.addEventListener('click', onZoomOutClick, false);
		locatorEl.addEventListener('click', onLocatorInClick, false);

		scpSignals.preSoundViewSwap.add(onPreSoundViewSwap);
		scpSignals.locationDataUpdated.add(onLocationDataUpdated);


		deferred.resolve();
		return deferred.promise;
	};

	this.quickShow = show;
	this.show = show;

	function show() {
		var location = dataManager.getCurrentLocation();
		googleMap.centerMap(location, getIsPrimary(), false);
	}

	function onZoomInClick() {
		googleMap.zoomIn();
	}

	function onZoomOutClick() {
		googleMap.zoomOut();
	}

	function onLocatorInClick() {

		googleMap.centerMap(currentLocation, getIsPrimary(), true);
	}

	function onPreSoundViewSwap() {

		var currentLocation = dataManager.getCurrentLocation();
		googleMap.centerMap(currentLocation, !getIsPrimary(), false);
	}

	function onLocationDataUpdated(newLocation) {
		currentLocation = newLocation;
		googleMap.centerMap(currentLocation, getIsPrimary(), true);
	}


	function getIsPrimary() {
		return parentEl.classList.contains('sound-primary');
	}


	this.dispose = function(){

		googleMap.hide();
		scpSignals.locationDataUpdated.remove(onLocationDataUpdated);
		scpSignals.preSoundViewSwap.remove(onPreSoundViewSwap);

		zoomInEl.removeEventListener('click', onZoomInClick);
		zoomOutEl.removeEventListener('click', onZoomOutClick);
		locatorEl.removeEventListener('click', onLocatorInClick);

	};

};