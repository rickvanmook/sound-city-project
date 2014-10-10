var Q = require('../../libs/q'),
	transitionEndEvent = require('../../utils/transitionEndEvent'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform'),
    domSelector = require('../../utils/domSelector'),
	scpSignals = require('../../core/scpSignals'),
	dataManager = require('../../core/DataManager');

module.exports = function(el) {

	var isUpdatingLocation = false,
		isUpdatingCity = false,
		isUpdatingArtist = false,
		maskEl,
		titleEl,
		cityEl,
		artistEl,
		numberEl,
		number,
		location,
		city,
		artist;

	this.init = function(){

		titleEl =  domSelector.first(domSelector.first(el, 'info-title'), 'js-copy');
		cityEl =   domSelector.first(domSelector.first(el, 'info-city'), 'js-copy');
		artistEl = domSelector.first(domSelector.first(el, 'info-artist-name'), 'js-copy');
		numberEl = domSelector.first(el, 'info-number');

		var locationData = dataManager.getCurrentLocation();
		number = locationData.number;
		location = locationData.name;
		city = locationData.cityName;
		artist = locationData.recorder;

		titleEl.innerHTML = location;
		cityEl.innerHTML = city;
		artistEl.innerHTML = artist;
		numberEl.innerHTML = number;
		scpSignals.locationDataUpdated.add(update);
	};

	function update(locationData, isGoingDown) {

		number = locationData.number;
		location = locationData.name;
		city = locationData.cityName;
		artist = locationData.recorder;

		numberEl.innerHTML = number;
		updateLocation(location, 0, isGoingDown);
		updateCity(city, 0.1, isGoingDown);
		updateArtist(artist, 0.2, isGoingDown);
	}

	function updateLocation(copy, delay, isGoingDown) {

		if(titleEl.innerHTML !== copy) {

			if(!isUpdatingLocation) {
				isUpdatingLocation = true;
				updateEl(titleEl, location, delay, isGoingDown)
					.then(function(){

						isUpdatingLocation = false;

						if(titleEl.innerHTML !== location) {
							updateLocation(location, 0, isGoingDown);
						}
					});
			}
		}
	}

	function updateCity(copy, delay, isGoingDown) {

		if(cityEl.innerHTML !== copy) {

			if(!isUpdatingCity) {
				isUpdatingCity = true;
				updateEl(cityEl, city, delay, isGoingDown)
					.then(function(){

						isUpdatingCity = false;

						if(cityEl.innerHTML !== city) {
							updateCity(city, 0, isGoingDown);
						}
					});
			}
		}
	}

	function updateArtist(copy, delay, isGoingDown) {

		if(artistEl.innerHTML !== copy) {

			if(!isUpdatingArtist) {
				isUpdatingArtist = true;
				updateEl(artistEl, artist, delay, isGoingDown)
					.then(function(){

						isUpdatingArtist = false;

						if(artistEl.innerHTML !== artist) {
							updateCity(artist, 0, isGoingDown);
						}
					});
			}
		}
	}

	function updateEl(el, copy, delay, isGoingDown) {

		var startA,
			startB,
			destinationA,
			destinationB;

		if(isGoingDown) {
			startA = 0;
			startB = -100;

			destinationA = 100;
			destinationB = 0;
		} else {

			startA = 0;
			startB = 100;

			destinationA = -100;
			destinationB = 0;

		}

		return tweenEl(el, startA, destinationA, delay)
			.then(function(){
				el.innerHTML = copy;
				tweenEl(el, startB, destinationB);
			});
	}

	function tweenEl(tweenEl, start, destination, delay) {

		var deferred = Q.defer(),
			time = el.classList.contains('is-shown') ? 0.3 : 0,
			easing,
			opacityStart,
			opacityEnd;

		if(destination === 0) {

			easing = Cubic.easeOut;
			opacityStart = 0;
			opacityEnd = 1;

		} else {

			easing = Cubic.easeIn;
			opacityStart = 1;
			opacityEnd = 0;

		}
		var tween = {
			y:start,
			opacity:opacityStart
		};



		TweenLite.to(tween, time, {
			ease:easing,
			delay:delay,
			y:destination,
			opacity:opacityEnd,
			onUpdate:function(){
				tweenEl.style.opacity = tween.opacity;
				tweenEl.style[unPrefixedTransform] = 'translate3d(0,' + tween.y + '%,0)';
			},
			onComplete:deferred.resolve
		});

		return deferred.promise;
	}



	this.dispose = function() {
		scpSignals.locationDataUpdated.remove(update);
		titleEl = null;
		cityEl = null;
		artistEl = null;
		numberEl = null;
	}

};