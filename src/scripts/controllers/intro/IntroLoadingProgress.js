var Q = require('../../libs/q'),
	domSelector = require('../../utils/domSelector'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform');

module.exports = function(parentEl) {
	
	var fadeEls = domSelector.all(parentEl, 'intro-loading-fade'),
		progressGutterEl = domSelector.first(parentEl, 'intro-loading-progressGutter'),
		progressEl = domSelector.first(parentEl, 'intro-loading-progress'),
		tweenProgress = {
			p:0
		};

	this.show = function() {

		return Q.all([
			tweenFadeEl(fadeEls[0], 0.5, 1, redrawFadeEl),
			tweenFadeEl(fadeEls[1], 0.55, 1, redrawFadeEl),
			tweenFadeEl(fadeEls[2], 0.6, 1, redrawFadeEl),
			tweenFadeEl(fadeEls[3], 0.65, 1, redrawFadeEl),
			tweenFadeEl(progressGutterEl,0.8,1, redrawProgressGutterEl)
		]);
	};
	
	this.update = function(newProgress, isDeferred) {

		var deferred;

		progressEl.style[unPrefixedTransform] = 'scaleX(' + newProgress + ')';

		if(isDeferred) {
			deferred = Q.defer();
			TweenLite.delayedCall(1.125, deferred.resolve);
			return deferred.promise;
		}
	};
	
	this.hide = function() {
		return Q.all([
			tweenFadeEl(fadeEls[0], 0.7, 0, redrawFadeEl),
			tweenFadeEl(fadeEls[1], 0.65, 0, redrawFadeEl),
			tweenFadeEl(fadeEls[2], 0.6, 0, redrawFadeEl),
			tweenFadeEl(fadeEls[3], 0.55, 0, redrawFadeEl),
			tweenFadeEl(progressGutterEl,0.4,0, redrawProgressGutterEl)
		]);
	};

	this.dispose = function(){
		fadeEls = null;
		progressGutterEl = null;
		progressEl = null;
	};

	function tweenFadeEl(el, delay, destination, redraw) {

		var deferred = Q.defer(),
			tweenObj = {p:1-destination},
			ease = destination === 1 ? Cubic.easeOut : Cubic.easeIn;

		TweenLite.to(tweenObj, 0.4, {
			delay:delay,
			p:destination,
			ease:ease,
			onUpdate:function() {
				redraw(el,tweenObj.p);
			},
			onComplete:deferred.resolve
		});

		return deferred.promise;
	}

	function redrawFadeEl(el,progress) {
		el.style.opacity = progress;
		el.style[unPrefixedTransform] = 'translate3d(0,'+(15 - 15 * progress)+'px,0)';
	}

	function redrawProgressGutterEl(el,progress) {
		el.style[unPrefixedTransform] = 'scaleX('+progress+')';
	}

};