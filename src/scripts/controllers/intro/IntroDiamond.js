var Q = require('../../libs/q'),
	domSelector = require('../../utils/domSelector'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform');

module.exports = function(el) {

	var pathEls = domSelector.all(el, 'intro-loading-path'),
		topOuterStroke = pathEls[0],
		bottomOuterStroke = pathEls[1],

		bottomInnerStroke = pathEls[2],
		topInnerStroke = pathEls[3],

		pathTweens = {
			topInner:558,
			bottomInner:558,

			topOuter:576,
			bottomOuter:576
		};


	this.show = function(){

		return Q.all([
			tweenStroke('topInner',0,0),
			tweenStroke('bottomInner',0.075,0),
			tweenStroke('topOuter',0.075,0),
			tweenStroke('bottomOuter',0,0)
		]);
	};

	this.hide = function(){

		return Q.all([
			tweenStroke('topInner',0.3,558),
			tweenStroke('bottomInner',0.375,558),
			tweenStroke('topOuter',0.375,576),
			tweenStroke('bottomOuter',0.3,576)
		]);
	};

	function tweenStroke(property, delay, destination) {

		var deferred = Q.defer(),
			tweenProps = {
			ease:Cubic.easeInOut,
			delay:delay,
			onUpdate:redraw,
			onComplete:deferred.resolve
		};

		tweenProps[property] = destination;

		TweenLite.to(pathTweens, 0.8, tweenProps);

		return deferred.promise;
	}

	function redraw() {


		topOuterStroke.style.strokeDashoffset = pathTweens.topOuter;
		bottomOuterStroke.style.strokeDashoffset = pathTweens.bottomOuter;
		bottomInnerStroke.style.strokeDashoffset = pathTweens.bottomInner;
		topInnerStroke.style.strokeDashoffset = pathTweens.topInner;
	}

};