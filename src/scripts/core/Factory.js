var Q = require('../libs/q'),
    domSelector = require('../utils/domSelector'),

	CONTROLLER_MODULES = {

		// sound
		SoundViewSwitcher:require('../controllers/sound/SoundViewSwitcher'),
		Map:require('../controllers/sound/Map'),
		Panorama:require('../controllers/sound/Panorama'),
		SkipArrow:require('../controllers/sound/controls/SkipArrow'),
		PlayPause:require('../controllers/sound/controls/PlayPause'),
		ScrubBar:require('../controllers/sound/controls/SrubBar'),


		TrackTime:require('../controllers/TrackTime'),
		Info:require('../controllers/sound/Info'),
		Busula:require('../controllers/sound/panorama/Busula'),

		// about
		InstagramGrid:require('../controllers/about/InstagramGrid'),
		Carousel:require('../controllers/about/Carousel'),
		SlideResizer:require('../controllers/about/SlideResizer')
	};

module.exports = function(el) {
	
	var controllers = [],
		controllersNum;
	
	this.init = function() {

		var controllerEls = domSelector.all(el, 'js-ctrl'),
			i = 0,
			controllerName,
			controllerEl,
			controller;

		controllersNum = controllerEls.length;

		for(i; i < controllersNum; i++) {

			controllerEl = controllerEls[i];
			controllerName = controllerEl.getAttribute('scp-ctrl');

			if(CONTROLLER_MODULES[controllerName]) {
				controller = new CONTROLLER_MODULES[controllerName](controllerEl);
				controller.name = controllerName;
				controllers.push(controller);
			}
		}

		return composeTaskList('init');
		
	};

	this.quickShow = function() {

		return composeTaskList('quickShow');
	};

	this.show = function() {

		return composeTaskList('show');
	};

	this.hide = function() {

		return composeTaskList('hide');
	};

	this.dispose = function() {

		var taskList = composeTaskList('dispose');
		controllers = null;

		return taskList;
	};


	function composeTaskList(method) {

		var taskList = [],
			i = 0,
			controllerMethod;

		for(i; i < controllersNum; i++) {

			controllerMethod = controllers[i][method];

			if(controllerMethod) {
				taskList.push(controllerMethod());
			}

		}

		return Q.all(taskList);

	}

};