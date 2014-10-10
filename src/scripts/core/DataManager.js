var AjaxRequest = require('../utils/AjaxRequest'),
	soundScapeManager =  require('./SoundScapeManager'),
	scpSignals =  require('./scpSignals'),
	analytics =  require('../utils/analytics'),
	SOUNDSCAPE_DATA_URL = 'data/soundscapes.json',
	ASSET_PATH = 'data/soundscapes/',
	isUpdating = false,
	START_INDEX = 0,
	maxIndex,
    cityList = [],
	locations = [],
	locationCount,
	currentIndex;

exports.init = function() {

	return new AjaxRequest(SOUNDSCAPE_DATA_URL,{isJSON:true})
		.then(function(cities){

			var i = 0,
                count = 0,
				j,
				city,
				cityId,
				cityName,
				location;

			for(i; i < cities.length; i++) {
				city = cities[i];

				cityId = city.id;
				cityName = city.name;

                cityList.push(city);

				for(j = 0; j < city.locations.length; j++) {

					location = city.locations[j];
                    location.index = count;
                    location.cityId = cityId;
					location.cityName = cityName;
					location.number = composeNumber(j+1);
					location.path = ASSET_PATH + cityId + '/' + location.id + '/';
					locations.push(location);

                    count++;
				}
			}

			locationCount = locations.length;
			maxIndex = locationCount-1;
			return updateIndex(START_INDEX);
		});
};

function composeNumber(number) {

	return ('0' + number).slice(-2);
}

function updateIndex(newIndex) {

	var currentLocation;

	if(!isUpdating) {


		newIndex = validateIndex(newIndex);

		if(newIndex !== currentIndex) {

			var isGoingRight;

			if(newIndex === maxIndex && currentIndex === 0) {
				isGoingRight = false;
			} else if(newIndex === 0 && currentIndex === maxIndex) {
				isGoingRight = true;
			} else if(newIndex < currentIndex) {
				isGoingRight = false;
			} else {
				isGoingRight = true;
			}

			isUpdating = true;
			currentIndex = newIndex;
			currentLocation = locations[currentIndex];

			analytics.setSoundPageId(
				{
					slug:currentLocation.cityId,
					label:currentLocation.cityName
				},
				{
					slug:currentLocation.id,
					label:currentLocation.name
				});

			scpSignals.locationDataUpdated.dispatch(currentLocation, isGoingRight);

			return soundScapeManager.updateLocation(currentLocation)
				.then(function(){
					scpSignals.locationDataLoaded.dispatch(currentLocation, isGoingRight);
					isUpdating = false;
				});
		}
	}
}

function validateIndex(index) {

	if(index > maxIndex) {
		index = 0;
	} else if(index < 0) {
		index = maxIndex;
	}

	return index;
}

exports.updateIndex = updateIndex;

exports.next = function() {
	updateIndex(currentIndex+1);
};

exports.previous = function() {
	updateIndex(currentIndex-1);
};

exports.update = updateIndex;

exports.getCurrentLocation = function() {
	return locations[currentIndex];
};

exports.getCityList = function() {
    return cityList;
};



exports.getLocationList = function(cityId) {

	var locationList;

	if(cityId === 'all') {

		locationList = locations;
	} else {

		locationList = locations.filter(function(location){
	        return location.cityId === cityId;
	    });
	}

	return [].slice.call(locationList,0);

};