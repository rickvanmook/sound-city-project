var currentPage = '/',
	currentCity,
	currentLocation,
	currentSection;

exports.setCurrentPage = function(newPage) {

	if(newPage !== currentPage) {

		currentPage = newPage;
		trackPageView(currentPage);
	}
};

exports.getCurrentPage = function() {
	return currentPage;
};

exports.trackSoundView = trackSoundView;

function trackSoundView() {

	var page = '/' + currentSection + '/' + currentCity.slug + '/' + currentLocation.slug + '/';
	currentPage = page;
	trackPageView(page);
}

exports.trackPageView = trackPageView;

function trackPageView(page, pageTitle) {

	var args = {
		'page':page
	};

	if(pageTitle) {
		args.title = pageTitle;
	}

	ga('send', 'pageview', args);
}

exports.trackEvent = function (category, action, optLabel) {

	ga('send', 'event', category, action, optLabel);
};


exports.setSoundPageSection = function(isMap){

	if(isMap) {
		currentSection = 'map';
	} else {
		currentSection = 'panorama';
	}

	trackSoundView();
};

exports.setSoundPageId = function(city, location){

	currentCity = city;
	currentLocation = location;
};
