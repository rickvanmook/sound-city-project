var Hammer = require('../../../libs/hammer'),
	audioPlayer = require('../../../core/audio/AudioPlayer'),
	audioFilter = require('../../../core/audio/AudioFilter'),
    domSelector = require('../../../utils/domSelector'),
	unPrefixedTransform = require('../../../utils/unPrefixedTransform'),
	scpSignals = require('../../../core/scpSignals'),
	body = document.body,
	LEFT_OFFSET = 240,
	BOTTOM_OFFSET = 40;

module.exports = function(el) {

	var progressEl = domSelector.first(el, 'scrub-progress'),
		loadedEl = domSelector.first(el, 'scrub-loaded'),
		hammer,
		isScrubbing = false,
		height = 0,
		width = 0,
		scrubEls;


	this.init = function() {
		scpSignals.timeUpdated.add(onTimeUpdated);
		scpSignals.loadedUpdated.add(onLoadedUpdated);

		scpSignals.windowResized.add(onWindowResized);

		window.addEventListener('mousemove', onWindowMouseMove, false);

		hammer = new Hammer(el);

		hammer.on('tap', onTap);
		hammer.on('pan', onPan);
		hammer.on('panstart', onPanStart);
		hammer.on('panend', onPanEnd);

		updateLoaded(audioPlayer.getCurrentLoaded());
		updateProgress(audioPlayer.getCurrentProgress());

		onWindowResized();
	};

	function onPanStart() {
		audioPlayer.pause(true);
	}

	function onPanEnd() {
		audioPlayer.play(true);
	}

	function onPan(e) {

		scrubToOffset(e.center.x);
	}

	function onTap(e) {

		scrubToOffset(e.center.x);
	}

	function scrubToOffset(centerX) {

		var scrubTarget = Math.max(0, Math.min(1, (centerX - LEFT_OFFSET) / width));

		audioPlayer.scrub(scrubTarget);
	}

	function onWindowResized() {

		height = body.offsetHeight;
		width = progressEl.offsetWidth;
	}

	function onWindowMouseMove(e) {

		if(e.clientX > LEFT_OFFSET && e.clientY > height - BOTTOM_OFFSET) {

			updateIsScrubbing(true);

		} else {

			updateIsScrubbing(false);
		}
	}

	function updateIsScrubbing(newIsScrubbing) {

		if(isScrubbing !== newIsScrubbing) {
			isScrubbing = newIsScrubbing;

			var method = isScrubbing ? 'add' : 'remove';

			if (!scrubEls) {
				scrubEls = domSelector.all(document, 'js-scrubEl');
			}

			scrubEls.forEach(function (scrubEl) {

				scrubEl.classList[method]('is-scrubbing');
			});
		}
	}

	function onTimeUpdated(currentTime, currentProgress) {
		updateProgress(currentProgress);
	}

	function onLoadedUpdated(currentLoaded) {
		updateLoaded(currentLoaded);
	}


	this.dispose = function() {

		window.removeEventListener('mousemove', onWindowMouseMove);

		scpSignals.windowResized.remove(onWindowResized);
		scpSignals.timeUpdated.remove(onTimeUpdated);
		scpSignals.loadedUpdated.remove(onLoadedUpdated);

		progressEl = null;
		loadedEl = null;

		hammer.off('tap', onTap);
		hammer.off('pan', onPan);
		hammer.off('panstart', onPanEnd);
		hammer.off('panend', onPanStart);

		hammer.destroy();
		hammer = null;
	};

	function updateProgress(progress) {
		progressEl.style[unPrefixedTransform] = 'scaleX('+progress+')';
	}

	function updateLoaded(loaded) {

		if(loaded >= 1) {

			loadedEl.classList.add('is-full');

		} else {

			loadedEl.classList.remove('is-full');
		}

		loadedEl.style[unPrefixedTransform] = 'scaleX('+loaded+')';
	}
}