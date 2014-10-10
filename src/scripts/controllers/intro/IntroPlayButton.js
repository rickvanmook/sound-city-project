var Q = require('../../libs/q'),
	audioPlayer = require('../../core/audio/AudioPlayer'),
	domSelector = require('../../utils/domSelector');

module.exports = function(parentEl) {

	var maskEls = domSelector.all(parentEl,'intro-loading-playMask'),
		copyMaskEl = domSelector.first(parentEl,'intro-play-copyMask'),
		copyEl = domSelector.first(parentEl, 'intro-play-copy'),
		shapeHitfieldEl = domSelector.first(parentEl, 'intro-shape-hitfield'),
		dividerEls  = domSelector.all(parentEl, 'intro-play-divider'),
		dividerCopyMask  = domSelector.first(parentEl, 'intro-play-mask'),
		isMouseOver = false,
		isVisible = false,
		curX = 0,
		maskTween = {x:0},
		showDeferred;

	shapeHitfieldEl.addEventListener('mouseover', onMouseOver, false);
	shapeHitfieldEl.addEventListener('mouseout', onMouseOut, false);


	this.show = function(){

		showDeferred = Q.defer();

		showCopy()
			.then(function(){


				shapeHitfieldEl.addEventListener('click', onPlayClick, false);
				shapeHitfieldEl.addEventListener('touchstart', onPlayTouch, false);

				isVisible = true;
				shapeHitfieldEl.style.cursor = 'pointer';
				if(isMouseOver) {
					tweenMask(145);
				}
			});

		return showDeferred.promise;
	};

	this.hideFocus = function(){

		shapeHitfieldEl.style.cursor = '';
		shapeHitfieldEl.removeEventListener('mouseover', onMouseOver);
		shapeHitfieldEl.removeEventListener('mouseout', onMouseOut);
		shapeHitfieldEl.removeEventListener('click', onPlayClick);
		shapeHitfieldEl.removeEventListener('touchstart', onPlayTouch);

		return tweenMask(0);
	};

	this.hide = function(){

		isVisible = false;

		return hideCopy();
	};

	function hideCopy() {

		return Q.all([
			tweenDivider(0, 0),
			tweenDivider(1, 0),
			tweenCopyMask(0)
		]);
	}

	function showCopy() {

		return Q.all([
			tweenDivider(0, 1),
			tweenDivider(1, 1),
			tweenCopyMask(1)
		]);
	}

	this.dispose = function(){

	};

	function onMouseOver() {

		isMouseOver = true;
		tweenMask(145);
	}

	function onMouseOut() {

		isMouseOver = false;
		tweenMask(0);
	}

	function onPlayTouch() {

		document.body.classList.add('is-touch');
		resolveShow();
	}

	function onPlayClick() {

		resolveShow();
	}

	function resolveShow() {

		audioPlayer.play();
		showDeferred.resolve();
	}

	function tweenMask(destination) {

		var deferred = Q.defer();

		if(isVisible && curX !== destination) {

			curX = destination;

			TweenLite.to(maskTween, 0.45, {
				ease: Cubic.easeInOut,
				x:curX,
				onUpdate:function() {
					maskEls[0].setAttribute('transform', 'rotate(45) translate('+maskTween.x+' 0)');
					maskEls[1].setAttribute('transform', 'rotate(45) translate(-'+maskTween.x+' 0)');
				},
				onComplete:deferred.resolve
			});
		} else {

			deferred.resolve();
		}

		return deferred.promise;

	}

	function tweenDivider(index, destination) {

		var deferred = Q.defer(),
			dividerEl = dividerEls[index],
			scale,
			translate1,
			translate2,
			tweenObj = {};

		if(destination === 1) {

			scale = 1;
			tweenObj.s = 0;

			translate1 = 0;
			tweenObj.t1 = 198;

			translate2 = index ? 90 : -90;
			tweenObj.t2 = 0;

			TweenLite.to(tweenObj, 0.35, {
				ease:Cubic.easeIn,
				s:scale,
				t1:translate1,
				onUpdate:redrawDivider,
				onComplete:function(){
					TweenLite.to(tweenObj, 0.7, {
						ease:Cubic.easeOut,
						t2: translate2,
						onUpdate: redrawDivider,
						onComplete:deferred.resolve
					});
				}
			});

		} else {

			scale = 0;
			tweenObj.s = 1;

			translate1 = 198;
			tweenObj.t1 = 0;

			translate2 = 0;
			tweenObj.t2 = index ? 90 : -90;

			TweenLite.to(tweenObj, 0.55, {
				delay:0.1,
				ease:Cubic.easeIn,
				t2: translate2,
				onUpdate:redrawDivider,
				onComplete:function(){
					TweenLite.to(tweenObj, 0.175, {
						ease:Cubic.easeOut,
						s:scale,
						t1:translate1,
						onUpdate: redrawDivider,
						onComplete:deferred.resolve
					});
				}
			});
		}

		function redrawDivider(){

			var translate1 = 'translate(' + tweenObj.t1 + ' 0) ',
				scale = 'scale(' + tweenObj.s + ' 1) ',
				translate2 = 'translate(' + tweenObj.t2 + ' 0)';

			dividerEl.setAttribute('transform',translate1 + scale + translate2);

		}

		return deferred.promise;
	}

	function tweenCopyMask(destination) {

		var deferred = Q.defer(),
			time,
			delay,
			scale,
			ease,
			translate,
			tweenObj = {};

		if(destination === 1) {

			time = 0.7;
			delay = 0.45;
			ease = Cubic.easeOut;

			scale = 1;
			tweenObj.s = 0;

			translate = 0;
			tweenObj.t = 198;
		} else {

			time = 0.55;
			delay = 0;
			ease = Cubic.easeIn;

			scale = 0;
			tweenObj.s = 1;

			translate = 198;
			tweenObj.t = 0;
		}

		TweenLite.to(tweenObj, time, {
			delay:delay,
			ease:ease,
			t:translate,
			s:scale,
			onUpdate: function(){

				var translate = 'translate(' + tweenObj.t + ' 0) ',
					scale = 'scale(' + tweenObj.s + ' 1)';

				copyEl.style.opacity = tweenObj.s;
				copyMaskEl.setAttribute('transform',translate + scale);

			},
			onComplete:deferred.resolve
		});

		return deferred.promise;
	}
};