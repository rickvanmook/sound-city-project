var Q = require('../libs/q'),
	audioFilter = require('../core/audio/AudioFilter'),
    domSelector = require('../utils/domSelector'),
	SocialView = require('../views/SocialView'),
	ListView = require('../views/ListView'),
	SoundView = require('../views/SoundView'),
	AboutView = require('../views/AboutView'),
	IntroView = require('../views/IntroView'),
	scpSignals = require('./scpSignals'),
	googleMap = require('./googleMap'),
	dataManager = require('./DataManager'),
	menu = require('./menu'),
	contentEl = document.body,
	storedLocation = false,
	isInTransition = false,
	currentViewId,
	currentView;

function onHashChanged() {


	if(isInTransition) {
		storedLocation = location.hash;
	} else {
		updateLocation(location.hash);
	}
}

function updateLocation(rawLocation) {


	var parsedLocation = rawLocation.substr(2).toLowerCase().split('/'),
		newViewId = parsedLocation[0],
		secondStep,
		newView;

	if(currentViewId !== newViewId) {

		isInTransition = true;
		newView = createView(newViewId);
		menu.update(newViewId);

		if(newViewId === '') {

			secondStep = function() {
				return newView.quickShow()
					.then(function(){
						audioFilter.clearSubSound();
						return currentView.hide();
					});
			};

		} else {

			secondStep = function() {
				audioFilter.muffleSubSound();
				return newView.show();
			};
		}


		return newView.init()
			.then(secondStep)
			.then(currentView.dispose)
			.then(function(){

				currentViewId = newViewId;
				currentView = newView;
				isInTransition = false;

				if(storedLocation !== false) {
					updateLocation(storedLocation);
					storedLocation = false;
				}
			})
			.done();


	} else if(parsedLocation.length > 1) {


		// TODO actually pass in correct params
		return Q.fcall(function(){
//				currentView.update(parsedLocation);
			})
			.done();

	}
}

function createView(viewId) {

	switch(viewId) {
		case '': return new SoundView(contentEl);
		case 'list': return new ListView(contentEl);
		case 'about': return new AboutView(contentEl);
	}
}

window.addEventListener('hashchange', onHashChanged, false);


exports.init = function(){

	var introView = new IntroView(),
		soundView = new SoundView(contentEl),
		social = new SocialView();

	Q.fcall(introView.init)
		.then(introView.show)
		.then(function(){
			return Q.all([
				dataManager.init()
					.then(googleMap.init),
				social.init()
			]);
		})
		.then(function(){
			return Q.all([
				soundView.init(),
				introView.hide()
			]);
		})
		.then(soundView.show)
		.then(introView.dispose)
		.then(function(){
			currentView = soundView;
			currentViewId = '';
			updateLocation(location.hash);
		})
		.done();
};