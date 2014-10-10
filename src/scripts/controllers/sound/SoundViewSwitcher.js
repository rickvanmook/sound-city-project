var Q = require('../../libs/q'),
	analytics = require('../../utils/analytics'),
	scpSignals = require('../../core/scpSignals'),
	domSelector = require('../../utils/domSelector'),
	InfoScrubBox = require('./controls/InfoScrubBox'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform'),

	PRIMARY_PRE_SWAP_ZINDEX = 5,

	STATE_RESET = 0,
	STATE_DEFAULT = 1,
	STATE_FOCUSED = 2,
	STATE_STAGE = 3,
	STATE_PRE_SWAPPED = 4,
	STATE_SWAPPED = 5,

	EASING_DEFAULT = Cubic.easeInOut,
	EASING_FOCUSED = Cubic.easeInOut,
	EASING_STAGE = Cubic.easeIn,
	EASING_SWAPPED = Cubic.easeOut,

	TIME_DEFAULT = 0.65,
	TIME_FOCUSED = 0.55,
	TIME_STAGE = 0.8,
	TIME_SWAPPED = 0.5,


	PRIMARY_DEFAULT_X,
	PRIMARY_DEFAULT_P,

	PRIMARY_FOCUSED_X = 210,
	PRIMARY_FOCUSED_P = 0,

	PRIMARY_STAGE_X = 0,
	PRIMARY_STAGE_P = 100,

	PRIMARY_PRE_SWAPPED_X = -300,
	PRIMARY_PRE_SWAPPED_P = 0,

	PRIMARY_SWAPPED_X,
	PRIMARY_SWAPPED_P,

	SECONDARY_DEFAULT_X = PRIMARY_SWAPPED_X = -270,
	SECONDARY_DEFAULT_P = PRIMARY_SWAPPED_P = 0,

	SECONDARY_FOCUSED_P = 0,
	SECONDARY_FOCUSED_X = -260,

	SECONDARY_STAGE_P = 0,
	SECONDARY_STAGE_X = 0,

	SECONDARY_SWAPPED_X = PRIMARY_DEFAULT_X = 180,
	SECONDARY_SWAPPED_P = PRIMARY_DEFAULT_P = 0,

	SOUND_CLASS = 'sound-map',
	PANORAMA_CLASS = 'sound-panorama',

	PRIMARY_CLASS ='sound-primary',
	SECONDARY_CLASS ='sound-secondary';

module.exports = function(el) {

	var infoScrubBoxes = [],
		contentEl,
		busulaSecondaryOffset,
		busulaTween,
		tweenObj,
		busulaEl,
		primaryEl,
		secondaryEl;

	this.init = function() {

		var infoScrubBox;

		contentEl = domSelector.first(document, 'content');
		contentEl.style[unPrefixedTransform] = 'translate3d(-260px,0,0)';

		busulaTween = {
			x:0
		};

		tweenObj = {
			p1:-100,
			x1:PRIMARY_DEFAULT_X,
			p2:-100,
			x2:PRIMARY_DEFAULT_X
		};


		busulaEl = domSelector.first(el, 'sound-busula');

		domSelector.all(el, 'sound-box').forEach(function(soundBoxEl, index){

			infoScrubBox = new InfoScrubBox(soundBoxEl);
			infoScrubBox.init(index === 0);
			infoScrubBoxes.push(infoScrubBox);
		});

		scpSignals.windowResized.add(onWindowResized);
		onWindowResized();
		initEls();
		redraw();

		if(secondaryEl.classList.contains(PANORAMA_CLASS)) {
			busulaTween.x = busulaSecondaryOffset;
			redrawBusula();
		}
	};

	this.quickShow = function() {

		analytics.setSoundPageSection(false);
		contentEl.style[unPrefixedTransform] = '';
		addListeners();
		resetTweenObjs();
		redraw();
		methodOnInfoScrubBox('show');
	};

	this.show = function() {

		var deferred = Q.defer(),
			contentTween = {x:-260};

		analytics.setSoundPageSection(false);

		methodOnInfoScrubBox('show');
		contentEl.style[unPrefixedTransform] = 'translate3d('+contentTween.x+'px,0,0)';


		var PRIM_TWEEN_TIME = 0.95,
			CONTENT_TWEEN_TIME = 0.4,
			DELAY = CONTENT_TWEEN_TIME;

		var navEl = domSelector.first(document, 'nav');
		navEl.classList.remove('is-hidden');


		TweenLite.to(tweenObj, PRIM_TWEEN_TIME, {
			ease:Cubic.easeOut,
			delay:DELAY,
			p1:PRIMARY_DEFAULT_P,
			x1:PRIMARY_DEFAULT_X,
			p2:SECONDARY_DEFAULT_P,
			x2:SECONDARY_DEFAULT_X,
			onUpdate:redraw,
			onComplete:function(){
				addListeners();
				deferred.resolve();
			}
		});


		TweenLite.to(contentTween, CONTENT_TWEEN_TIME, {
			ease:Cubic.easeIn,
			x:0,
			onUpdate:function(){
				contentEl.style[unPrefixedTransform] =
					'translate3d('+Math.round(contentTween.x)+'px,0,0)';
			},
			onComplete:function(){contentEl.style[unPrefixedTransform] = '';}
		});


		return deferred.promise;
	};

	function methodOnInfoScrubBox(method) {

		var taskList = [];

		infoScrubBoxes.forEach(function(infoScrubBox){

			taskList.push(infoScrubBox[method]());
		});

		return Q.all(taskList);
	}

	function onWindowResized() {

		var width = el.offsetWidth,
			BUSULA_RIGHT = 200,
			SECONDARY_MID = 90;

		busulaSecondaryOffset = -(width - BUSULA_RIGHT - (busulaEl.offsetWidth / 2) - SECONDARY_MID - (-SECONDARY_DEFAULT_X));
	}

	this.dispose = function(){

		scpSignals.windowResized.remove(onWindowResized);

		removeListeners();
		TweenLite.killTweensOf(tweenObj);
		infoScrubBoxes.forEach(function(infoScrubBox){
			infoScrubBox.dispose();
			infoScrubBox = null;
		});

		busulaEl = null;
		primaryEl = null;
		secondaryEl = null;
	};


	function initEls() {

		primaryEl = domSelector.first(el, PRIMARY_CLASS);
		secondaryEl = domSelector.first(el, SECONDARY_CLASS);

		resetEls();
	}

	function resetEls() {
		primaryEl.style[unPrefixedTransform] =
		secondaryEl.style[unPrefixedTransform] =
		primaryEl.style.left =
		secondaryEl.style.left =
		primaryEl.style.zIndex =
		secondaryEl.style.zIndex = '';
	}

	function resetTweenObjs() {

		tweenObj = {
			p1:PRIMARY_DEFAULT_P,
			x1:PRIMARY_DEFAULT_X,
			p2:SECONDARY_DEFAULT_P,
			x2:SECONDARY_DEFAULT_X,
			y2:0
		};

	}

	function addListeners() {
		secondaryEl.addEventListener('click', onSecondaryClick);
		secondaryEl.addEventListener('mouseover', onSecondaryMouseOver);
		secondaryEl.addEventListener('mouseout', onSecondaryMouseOut);
	}

	function removeListeners() {
		secondaryEl.removeEventListener('click', onSecondaryClick);
		secondaryEl.removeEventListener('mouseover', onSecondaryMouseOver);
		secondaryEl.removeEventListener('mouseout', onSecondaryMouseOut);
	}

	function onSecondaryClick() {

		removeListeners();

		stageSwap().then(finishSwap);
	}

	function stageSwap() {

		methodOnInfoScrubBox('stage');

		if(primaryEl.classList.contains(SOUND_CLASS)) {

			TweenLite.to(busulaTween, TIME_STAGE+TIME_SWAPPED, {
				ease:Cubic.easeInOut,
				x:0,
				onUpdate:redrawBusula
			});
		}

		return tweenState(STATE_STAGE).then(preSwap);
	}

	function preSwap() {

		if(primaryEl.classList.contains(SOUND_CLASS)) {

			scpSignals.preSoundViewSwap.dispatch();

		} else {

			TweenLite.killTweensOf(busulaTween);
			busulaTween.x = busulaSecondaryOffset;
			redrawBusula();
		}

		secondaryEl.style.zIndex = PRIMARY_PRE_SWAP_ZINDEX;

		return tweenState(STATE_PRE_SWAPPED);
	}

	function finishSwap() {

		methodOnInfoScrubBox('swap');
		return tweenState(STATE_SWAPPED).then(postSwap);
	}

	function postSwap() {

		primaryEl.classList.remove(PRIMARY_CLASS);
		secondaryEl.classList.remove(SECONDARY_CLASS);

		primaryEl.classList.add(SECONDARY_CLASS);
		secondaryEl.classList.add(PRIMARY_CLASS);

		document.body.offsetHeight;

		initEls();
		addListeners();
		resetTweenObjs();

		var isMap = primaryEl.classList.contains('sound-map');

		analytics.setSoundPageSection(isMap);
	}

	function onSecondaryMouseOver() {

		tweenState(STATE_FOCUSED);
	}

	function onSecondaryMouseOut() {

		tweenState(STATE_DEFAULT)
			.then(function(){
				primaryEl.style[unPrefixedTransform] =
				secondaryEl.style[unPrefixedTransform] = '';
			});
	}

	function tweenState(state) {

		var primarySettings = getPrimaryOffsets(state),
			secondarySettings = getSecondaryOffsets(state);

		var time = TIME_DEFAULT,
			easing;

		switch(state) {
			case STATE_RESET:
				time = 0;
			case STATE_DEFAULT:
				easing = EASING_DEFAULT;
				break;
			case STATE_FOCUSED:
				time = TIME_FOCUSED;
				easing = EASING_FOCUSED;
				break;
			case STATE_STAGE:
				time = TIME_STAGE;
				easing = EASING_STAGE;
				break;
			case STATE_PRE_SWAPPED:
				time = 0;
				break;
			case STATE_SWAPPED:
				time = TIME_SWAPPED;
				easing = EASING_SWAPPED;
				break;
		}

		return elTweener(time, easing, primarySettings.p, primarySettings.x, secondarySettings.p, secondarySettings.x);
	}


	function getPrimaryOffsets(state) {

		var destinationX,
			destinationP;

		switch(state) {
			case STATE_RESET:
			case STATE_DEFAULT:
				destinationX = PRIMARY_DEFAULT_X;
				destinationP = PRIMARY_DEFAULT_P;
				break;
			case STATE_FOCUSED:
				destinationX = PRIMARY_FOCUSED_X;
				destinationP = PRIMARY_FOCUSED_P;
				break;
			case STATE_STAGE:
				destinationX = PRIMARY_STAGE_X;
				destinationP = PRIMARY_STAGE_P;
				break;
			case STATE_PRE_SWAPPED:
				destinationX = PRIMARY_PRE_SWAPPED_X;
				destinationP = PRIMARY_PRE_SWAPPED_P;
				break;
			case STATE_SWAPPED:
				destinationX = PRIMARY_SWAPPED_X;
				destinationP = PRIMARY_SWAPPED_P;
				break;
		}

		return {
			p:destinationP,
			x:destinationX
		};
	}

	function getSecondaryOffsets(state) {

		var destinationX,
			destinationP;

		switch(state) {
			case STATE_RESET:
			case STATE_DEFAULT:
				destinationX = SECONDARY_DEFAULT_X;
				destinationP = SECONDARY_DEFAULT_P;
				break;
			case STATE_FOCUSED:
				destinationX = SECONDARY_FOCUSED_X;
				destinationP = SECONDARY_FOCUSED_P;
				break;
			case STATE_STAGE:
			case STATE_PRE_SWAPPED:
				destinationX = SECONDARY_STAGE_X;
				destinationP = SECONDARY_STAGE_P;
				break;
			case STATE_SWAPPED:
				destinationX = SECONDARY_SWAPPED_X;
				destinationP = SECONDARY_SWAPPED_P;
				break;
		}

		return {
			p:destinationP,
			x:destinationX
		};
	}

	function elTweener(time, easing, destinationP1, destinationX1, destinationP2, destinationX2) {


		var deferred = Q.defer();

		TweenLite.killTweensOf(tweenObj);

		TweenLite.to(tweenObj, time, {
			ease:easing,
			p1:destinationP1 !== undefined ? destinationP1 : tweenObj.p1,
			x1:destinationX1 !== undefined ? destinationX1 : tweenObj.x1,
			p2:destinationP2 !== undefined ? destinationP2 : tweenObj.p2,
			x2:destinationX2 !== undefined ? destinationX2 : tweenObj.x2,
			onUpdate:redraw,
			onComplete:deferred.resolve
		});

		return deferred.promise;

	}

	function redraw() {

		primaryEl.style[unPrefixedTransform] =
			'translate3d('+tweenObj.p1+'%,0,0) ' +
			'translateX('+Math.round(tweenObj.x1)+'px)';

		secondaryEl.style[unPrefixedTransform] =
			'translate3d('+tweenObj.p2+'%,0,0)' +
			'translateX('+Math.round(tweenObj.x2)+'px)';
	}

	function redrawBusula() {

		busulaEl.style[unPrefixedTransform] = 'translate3d('+busulaTween.x+'px,0,0)';
	}
};