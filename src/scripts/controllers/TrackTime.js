var audioPlayer = require('../core/audio/AudioPlayer'),
    domSelector = require('../utils/domSelector'),
	scpSignals = require('../core/scpSignals');

module.exports = function(el) {

	var minutesEl = domSelector.first(el, 'sound-timer-minutes'),
		secondsEl = domSelector.first(el, 'sound-timer-seconds');

	function convertTime(totalSeconds) {

		var minutes = Math.floor(totalSeconds/60),
			seconds = totalSeconds%60;

		minutesEl.innerHTML = pad(minutes);
		secondsEl.innerHTML = pad(seconds);
	}


	function pad(num){
		return ('00'+num).slice(-2);
	}

	this.init = function() {
		scpSignals.timeUpdated.add(onTimeUpdated);
	};

	function onTimeUpdated(currentTime) {
		convertTime(currentTime);
	}

	this.quickShow = show;
	this.show = show;

	function show() {

		convertTime(audioPlayer.getCurrentTime());
	}

	this.hide = function() {

		minutesEl.innerHTML = '';
		secondsEl.innerHTML = '';
	};

	this.dispose = function() {
		scpSignals.timeUpdated.remove(onTimeUpdated);
	}
}