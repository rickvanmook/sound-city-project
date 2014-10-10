var getElementIdex = require('../../utils/getElementIndex'),
	CarouselSlide =  require('./CarouselSlide'),
    domSelector = require('../../utils/domSelector'),
	transitionEndEvent = require('../../utils/transitionEndEvent'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform'),
	imgLoader = require('../../utils/imgLoader'),
	IS_LOADED_CLASS = 'is-loaded',
	IS_LOADING_CLASS = 'is-loading',
	ASSET_PATH = 'assets/images/about/',
	Q = require('../../libs/q');

module.exports = function(containerEl) {


	var DIMENSIONS_HEAD = [1799,1150],
		DIMENSIONS_RECORDING = [2099,1150],
		DIMENSIONS_DETAILS = [1788,1150],
		NUM_SLIDES = 3;

	var percentage,
		currentSlide = 0,
		slideProgress = 0.5,
		slideTween = {p:0.5},
		hitFieldEls,
		els,
		menuEls,
		slideA,
		slideB,
		slideC;

	this.init = function() {

		els = domSelector.all(containerEl,'about-carousel-slide');
		hitFieldEls = domSelector.all(containerEl, 'about-carousel-hitField');
		menuEls = domSelector.all(containerEl,'js-carouselMenuItem');

		var menuActiveEls = domSelector.all(containerEl,'about-carousel-menu-item--active');
		slideA = new CarouselSlide(els[0], menuActiveEls[0], 0);
		slideB = new CarouselSlide(els[1], menuActiveEls[1], 1);
		slideC = new CarouselSlide(els[2], menuActiveEls[2], 2);

		hitFieldEls[0].addEventListener('click', previous, false);
		hitFieldEls[1].addEventListener('click', next, false);

		menuEls.forEach(function(menuEl){

			menuEl.addEventListener('click', onMenuElClick, false);
			menuEl.addEventListener('touchend', onMenuElClick, false);
		});

		redraw(0.5);
		resetTimer();
	};

	this.dispose = function() {

		TweenLite.killDelayedCallsTo(next);

		slideA.dispose();
		slideB.dispose();
		slideC.dispose();

		var menuEl;

		while(menuEls.length) {
			menuEl = menuEls.shift();
			menuEl.removeEventListener('click', onMenuElClick);
			menuEl.removeEventListener('touchend', onMenuElClick);
			menuEl = null;
		}

		hitFieldEls[0].addEventListener('click', previous, false);
		hitFieldEls[1].addEventListener('click', next, false);

		hitFieldEls = null;
		els = null;
		menuEls = null;
		slideA = null;
		slideB = null;
		slideC = null;
	};

	function onMenuElClick(e) {

		var clickedIndex = getElementIdex(e.target),
			offset = clickedIndex - currentSlide;

		updateProgress(slideProgress+offset);
	}

	function resetTimer() {
		TweenLite.killDelayedCallsTo(next);
		TweenLite.delayedCall(7, next);
	}

	function previous() {
		updateProgress(slideProgress-1);
	}

	function next() {
		updateProgress(slideProgress+1);
	}

	function updateProgress(slideDestination) {

		resetTimer();

		if(slideDestination !== slideProgress) {
			slideProgress = slideDestination;

			currentSlide = Math.floor(slideProgress%NUM_SLIDES);
			if(currentSlide < 0) {
				currentSlide += NUM_SLIDES;
			}

			TweenLite.to(slideTween, 0.85, {
				ease:Cubic.easeInOut,
				p:slideProgress,
				onUpdate:function(){

					var normalizedProgress = slideTween.p%NUM_SLIDES;

					if(normalizedProgress < 0) {
						normalizedProgress += NUM_SLIDES;
					}

					redraw(normalizedProgress);
				}
			});
		}
	}

	function redraw(progress) {

		slideA.update(progress);
		slideB.update(progress);
		slideC.update(progress);
	}
};