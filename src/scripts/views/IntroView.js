var Q = require('../libs/q'),
    domSelector = require('../utils/domSelector'),
	IntroCopy = require('../controllers/intro/IntroCopy'),
	IntroDiamond = require('../controllers/intro/IntroDiamond'),
	IntroLoadingProgress = require('../controllers/intro/IntroLoadingProgress'),
	IntroPlayButton = require('../controllers/intro/IntroPlayButton'),
	scpSignals = require('../core/scpSignals'),
	unPrefixedTransform = require('../utils/unPrefixedTransform'),
	transitionEndEvent = require('../utils/transitionEndEvent');

module.exports = function() {

    var hideDeferred,
	    introEl = domSelector.first(document, 'intro'),
	    progressContainerEl = domSelector.first(introEl, 'intro-loading-progressContainer'),
	    introLoadingEl = domSelector.first(introEl, 'intro-loading'),
	    introCopy = new IntroCopy(introEl),
	    introDiamond = new IntroDiamond(introEl),
	    introLoadingProgress = new IntroLoadingProgress(progressContainerEl),
	    introPlayButton = new IntroPlayButton(introLoadingEl);


	this.init = function(){

		scpSignals.loadProgressUpdated.add(onLoadProgressUpdated);
	};

	this.show = function() {

		return introCopy.hide()
			.then(
				function(){

					return Q.all([
						introDiamond.show(),
						introLoadingProgress.show()
					]);
			});
	};

	this.hide = function() {

		hideDeferred = Q.defer();

		return hideDeferred.promise;
	};

	function onLoadProgressUpdated(newProgress) {

		if(newProgress >= 1) {

			waitForPlayClick();

		} else {
			introLoadingProgress.update(newProgress, false);
		}
	}

	function waitForPlayClick() {

		introLoadingProgress.update(1, true)
			.then(introLoadingProgress.hide)
			.then(introPlayButton.show)
			.then(introPlayButton.hideFocus)
			.then(function () {
				return Q.all([
					introDiamond.hide(),
					introPlayButton.hide()
				]);
			})
			.then(function(){

				hideDeferred.resolve();
			});
	}

	this.dispose = function() {

		scpSignals.loadProgressUpdated.remove(onLoadProgressUpdated);

		introCopy.dispose();
		introLoadingProgress.dispose();
		introPlayButton.dispose();

		introCopy = null;
		introLoadingProgress = null;
		introPlayButton = null;

		introEl.parentNode.removeChild(introEl);
		introEl = null;
	};


};