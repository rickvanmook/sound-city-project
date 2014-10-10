var scpSignals = require('../../../core/scpSignals'),
	audioPlayer = require('../../../core/audio/AudioPlayer'),
	PLAYING_CLASS = 'is-playing';

module.exports = function(el) {

	var isPlaying;

	this.init = function() {

		el.addEventListener('click', onClick);

		isPlaying = audioPlayer.getIsPlaying();

		if(isPlaying) {
			el.classList.add(PLAYING_CLASS);
		}

		scpSignals.playPauseUpdated.add(playPauseUpdated);
	};

	function onClick() {
		if(isPlaying) {

			audioPlayer.pause();
		} else {

			audioPlayer.play();
		}
	}

	function playPauseUpdated(newIsPlaying) {

		isPlaying = newIsPlaying;

		if(isPlaying) {

			el.classList.add(PLAYING_CLASS);

		} else {

			el.classList.remove(PLAYING_CLASS);
		}

	}

	this.dispose = function() {

		scpSignals.playPauseUpdated.remove(playPauseUpdated);
		el.removeEventListener('click', onClick);
		el = null;
	};

};