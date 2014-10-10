var Q = require('../../libs/q'),
	domSelector = require('../../utils/domSelector'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform');

module.exports = function(el) {

	var introductionEl = domSelector.first(el, 'intro-introduction'),
		introSubtitleEls = domSelector.all(el, 'intro-subtitle'),
		tweenObjs = [
			{y:0,o:1},
			{y:0,o:1}
		];

	this.hide = function(){

		var deferred = Q.defer();

		introductionEl.classList.add('is-hidden');
		TweenLite.delayedCall(1.8,  deferred.resolve);

		tweenSubtitleEl(0, 75, 0);
		tweenSubtitleEl(1, -75, 0);

		return deferred.promise;
	};

	this.dispose = function(){

		introductionEl = null;
		introSubtitleEls = null;
	};

	function tweenSubtitleEl(index, newY, newO) {

		var el = introSubtitleEls[index],
			tweenObj = tweenObjs[index],
			delay = 1 + (index*0.05);

		TweenLite.to(tweenObj, 0.35, {
			delay:delay,
			ease:Cubic.easeIn,
			y:newY,
			o:newO,
			onUpdate:function(){
				el.style.opacity = tweenObj.o;
				el.style[unPrefixedTransform] = 'translate3d(0,' + tweenObj.y + 'px,0)';
			}
		});
	}
};