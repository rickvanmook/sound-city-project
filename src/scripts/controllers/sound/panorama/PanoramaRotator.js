var Hammer = require('../../../libs/hammer'),
	scpSignals = require('../../../core/scpSignals'),
	audioRotator = require('../../../core/audio/AudioRotator');


module.exports = function(el) {

	var hammer,
		tweenObj = {
			d:0
		},
		startDegrees = 0,
		currentDegrees = 0,
		totalWidth;

	this.init = function() {

		currentDegrees = audioRotator.getDegrees();

		hammer = new Hammer(el, {
			recognizers: [
				[Hammer.Pan]
			]
		});

		hammer.on('panstart', onPanStart);
		hammer.on('pan', onPan);
		hammer.on('panend', onPanEnd);

	};

	this.resize = function(newTotalWidth) {

		totalWidth = newTotalWidth;
		updateDegrees(currentDegrees, true);
	};

	function onPan(e) {
		el.classList.add('is-grabbing');
		var degreeOffset = 360*(e.deltaX/totalWidth);


		updateDegrees(startDegrees - degreeOffset);
	}

	function onPanStart(e) {
		startDegrees = currentDegrees;
		TweenLite.killTweensOf(tweenObj);
	}

	function onPanEnd(e) {
		el.classList.remove('is-grabbing');
		tweenObj.d = currentDegrees;
		var tweenVelocity = (1+e.velocityX/30);

		if(tweenVelocity !== 0) {

			TweenLite.killTweensOf(tweenObj);
			TweenLite.to(tweenObj, 0.5, {
				ease:Quint.easeOut,
				d:currentDegrees * tweenVelocity,
				onUpdate:function(){

					updateDegrees(tweenObj.d);
				}

			});
		}
	}

	function updateDegrees(newDegrees, forceRedraw) {

		newDegrees = newDegrees%360;

		if(newDegrees < 0) {
			newDegrees += 360;
		}

		if(newDegrees !== currentDegrees || forceRedraw) {

			currentDegrees = newDegrees;
			scpSignals.rotationUpdated.dispatch(currentDegrees);
		}
	}


	this.dispose = function() {

		TweenLite.killTweensOf(tweenObj);
		tweenObj = null;

		hammer.off('panstart', onPanStart);
		hammer.off('pan', onPan);
		hammer.off('panend', onPanEnd);

		hammer.destroy();
		hammer = null;


	}
};