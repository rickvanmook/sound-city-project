var Q = require('../../libs/q'),
	audioContext = require('../../utils/centralAudioContext'),
	lowFilter = audioContext.createBiquadFilter(),
	isOnSocial = false,
	isOnSubPage = false,
	isMuffled = false,
	currentGain = 0,
	tweenObj = {
		gain:0
	},
	mainGain;


lowFilter.type = lowFilter.LOWPASS;
lowFilter.frequency.value = 24000.0;

exports.init = function(initMainGain) {

	mainGain = initMainGain;
	currentGain = 1;
	mainGain.gain.value = 1;
	mainGain.connect(lowFilter);
	lowFilter.connect(audioContext.destination);

	window.gain = mainGain;
	window.filter = lowFilter;
	window.context = audioContext;
};



exports.muffleSocialSound = function() {

	isOnSocial = true;
	muffleSound();
};

exports.muffleSubSound = function() {

	isOnSubPage = true;
	muffleSound();
};

exports.clearSocialSound = function() {

	isOnSocial = false;
	muffleSound();
};

exports.clearSubSound = function() {

	isOnSubPage = false;
	muffleSound();
};

function muffleSound(){

	var freq;

	if(isOnSocial || isOnSubPage) {

		isMuffled = true;

		if(isOnSocial && isOnSubPage) {

			freq = 250.0;
			currentGain = 0.2;
		} else {

			freq = 500.0;
			currentGain = 0.3;
		}

		lowFilter.frequency.value = freq;
		tweenTo(1, currentGain);
	} else {

		lowFilter.frequency.value = 24000.0;

		isMuffled = false;
		currentGain = 1;
		tweenTo(1, currentGain);
	}
}

exports.fadeIn = function() {
	tweenTo(0.4, currentGain);
};

exports.fadeOut = function() {
	tweenTo(0, 0);
};

function tweenTo(time, value) {

	TweenLite.to(mainGain.gain, time, {
		value:value
	});
}