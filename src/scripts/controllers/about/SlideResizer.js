var scpSignals = require('../../core/scpSignals'),
	DIMENSIONS_HEAD = [1799,1150],
	DIMENSIONS_RECORDING = [2099,1150],
	DIMENSIONS_DETAILS = [1788,1150];

module.exports = function(el) {

	var parentEl,
		containerEl,
		specificResize,
		containerWidth,
		containerHeight;

	this.init = function() {

		parentEl = el.parentElement;
		containerEl = parentEl.parentElement;
		specificResize = getSpecificResizeMethod(parentEl);
		scpSignals.windowResized.add(resize);
	};

	this.show = resize;
	this.dispose = function() {


		scpSignals.windowResized.remove(resize);
		specificResize = null;
		parentEl = null;
		containerEl = null;
		el = null;
	};

	function resize() {

		containerWidth = containerEl.offsetWidth;
		containerHeight = containerEl.offsetHeight;

		specificResize();
	}

	function resizeHead() {

		var ratio = containerHeight / DIMENSIONS_HEAD[1],
			newWidth =  Math.round(DIMENSIONS_HEAD[0] * ratio),

			widthPx = newWidth + 'px ',
			heightPx = containerHeight + 'px';

		el.style.width = widthPx;
		el.style.height = heightPx;
		el.style.backgroundSize = widthPx + heightPx;
	}

	function resizeRecording() {

		var heightRatio = containerHeight / DIMENSIONS_RECORDING[1],
			newWidth =  Math.round(DIMENSIONS_RECORDING[0] * heightRatio),
			newHeight = containerHeight,

			offsetEar = -Math.round(newWidth*0.645),
			offsetScreen = containerWidth * 0.572,
			bgOffset = Math.round(offsetEar+offsetScreen),

			widthPx = newWidth + 'px ',
			heightPx = newHeight + 'px';


		el.style.left = Math.min(0, bgOffset)+'px';
		el.style.width = widthPx;
		el.style.height = heightPx;
		el.style.backgroundSize = widthPx + heightPx;
	}

	function resizeDetails() {

		var ratio = containerHeight / DIMENSIONS_DETAILS[1],
			newWidth =  Math.round(DIMENSIONS_DETAILS[0] * ratio),

			widthPx = newWidth + 'px ',
			heightPx = containerHeight + 'px';


		el.style.width = widthPx;
		el.style.height = heightPx;
		el.style.backgroundSize = widthPx + heightPx;
	}

	function getSpecificResizeMethod(el) {

		var CLASS_PREFIX = 'about-carousel-slide--';

		if(el.classList.contains(CLASS_PREFIX+'recording')) {

			return resizeRecording;

		} else if(el.classList.contains(CLASS_PREFIX+'head')) {

			return resizeHead;

		} else if(el.classList.contains(CLASS_PREFIX+'details')) {

			return resizeDetails;

		} else {

			return noop;

		}
	}
};

