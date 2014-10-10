var scpSignals = require('../../../core/scpSignals'),
    domSelector = require('../../../utils/domSelector'),
	audioRotator = require('../../../core/audio/AudioRotator'),
	unPrefixedTransform = require('../../../utils/unPrefixedTransform');

module.exports = function(el) {


	var viewPortEl;

	this.init = function() {

		viewPortEl = domSelector.first(el, 'sound-busula-viewPort');
		rotate(audioRotator.getDegrees());
		scpSignals.rotationUpdated.add(rotate);
	};

	this.dispose = function() {

		scpSignals.rotationUpdated.remove(rotate);
		viewPortEl = null;
	};

	function rotate(degrees) {

		viewPortEl.style[unPrefixedTransform] = 'rotate('+(degrees-45)+'deg)';
	}
};