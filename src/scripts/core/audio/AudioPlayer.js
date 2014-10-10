var Q = require('../../libs/q'),
	dataManager = require('../../core/DataManager'),
	scpSignals = require('../scpSignals'),
	audioContext = require('../../utils/centralAudioContext'),
	audioFilter = require('./AudioFilter'),
	audioRotator = require('./AudioRotator'),
	Signal = require('../../libs/signals'),
	INTRO_TIME = 10;

var playedIntro = new Signal(),
	isPastIntro = false,
	isPlaying = false,
	currentTime = 0,
	currentProgress = 0,
	totalDuration = 0,
	currentLoaded = 0,
	bufferStartOffset = 0,
	currentBuffer = null,
	currentBufferPlayer = null;


exports.playedIntro = playedIntro;
exports.play = function(ignorePlayState) { updateIsPlaying(true, ignorePlayState); };
exports.pause = function(ignorePlayState) { updateIsPlaying(false, ignorePlayState); };
exports.getIsPlaying = function() {return isPlaying; };
exports.getCurrentTime = function() {return currentTime; };
exports.getCurrentLoaded = function() {return currentLoaded; };
exports.getCurrentProgress = function() {return currentProgress; };

scpSignals.locationDataUpdated.add(function(newData) {

	audioFilter.fadeOut();
	totalDuration = Math.floor(newData.duration);
	reset();
	stop();
	updateCurrentLoaded(0);
});

function updateIsPlaying(newIsPlaying, ignorePlayState) {

	if(isPlaying !== newIsPlaying) {

		isPlaying = newIsPlaying;

		if(isPlaying) {
			audioFilter.fadeIn();
			play();
		} else {
			audioFilter.fadeOut();
			pause();
		}

		if(!ignorePlayState) {
			scpSignals.playPauseUpdated.dispatch(isPlaying);
		}
	}
}


exports.scrub = function(target) {

	var normalizedTarget = Math.min(currentLoaded, target),
		newStartOffset = normalizedTarget * totalDuration;


	if(isPlaying) {
		stop();
		bufferStartOffset = newStartOffset;
		play();
	} else {

		bufferStartOffset = newStartOffset;

		var newTime = Math.floor(totalDuration * normalizedTarget);
		updateCurrentTime(newTime);
	}
};

exports.updateBuffer = function(newBuffer) {

	currentBuffer = newBuffer;
	updateCurrentLoaded(currentBuffer.duration/totalDuration);

	if(isPlaying && currentLoaded > 0) {

		pause();
		play(bufferStartOffset);
	}
};

function play() {

	currentBufferPlayer = new BufferPlayer(currentBuffer);
	currentBufferPlayer.timeUpdated.add(updateCurrentTime);
	currentBufferPlayer.bufferEnded.add(onBufferEnded);
	currentBufferPlayer.start(bufferStartOffset);
	audioFilter.fadeIn();
}

function pause() {

	bufferStartOffset += stop();
}

function stop() {

	var stopOffset = 0;

	if(currentBufferPlayer !== null) {
		stopOffset = currentBufferPlayer.stop();
		currentBufferPlayer = null;
	}

	return stopOffset;
}

function reset() {
	isPastIntro = false;
	bufferStartOffset = 0;
	updateCurrentTime(0);
	updateCurrentLoaded(0);
}

function onBufferEnded(){

	if(totalDuration <= currentTime) {
		dataManager.next();
	}
}

function updateCurrentTime(newTime) {

	newTime = Math.min(totalDuration, Math.max(0, newTime));

	if(currentTime !== newTime) {

		currentTime = newTime;
		currentProgress = Math.min(1, currentTime / totalDuration);
		scpSignals.timeUpdated.dispatch(totalDuration - currentTime, currentProgress);

		if(!isPastIntro && currentTime >= INTRO_TIME) {
			isPastIntro = true;
			playedIntro.dispatch();
		}
	}
}

function updateCurrentLoaded(newCurrentLoaded) {

	currentLoaded = Math.round(newCurrentLoaded * 100) / 100;
	scpSignals.loadedUpdated.dispatch(currentLoaded);
}


function BufferPlayer(buffer) {

	var source = audioContext.createBufferSource(),
		bufferEnded = new Signal(),
		timeUpdated = new Signal(),
		isTicking = false,
		isFocused = document.hasFocus(),
		duration = buffer.duration,
		currentTime,
		startOffset,
		startTime;

	source.buffer = buffer;
	source.onended = onEnded;

	audioRotator.updateSource(source);

	this.bufferEnded = bufferEnded;
	this.timeUpdated = timeUpdated;

	this.start = function(initialStartOffset) {

		startOffset = initialStartOffset;
		startTime = audioContext.currentTime;
		isTicking = true;
		scpSignals.windowFocusChanged.add(onWindowFocusedChanged);
		timeTicker();
		source.start(0, startOffset % duration);
	};

	this.stop = function() {

		source.stop(0);
		source.onended = null;
		source = null;
		isTicking = false;

		scpSignals.windowFocusChanged.remove(onWindowFocusedChanged);
		bufferEnded.removeAll();
		timeUpdated.removeAll();

		bufferEnded = null;
		timeUpdated = null;

		return audioContext.currentTime - startTime;
	};

	function onWindowFocusedChanged(newIsFocused) {
		isFocused = newIsFocused;
	}

	function onEnded() {

		bufferEnded.dispatch();
	}

	function timeTicker() {

		if(isTicking) {

			var newTime = Math.round(Math.min(duration, audioContext.currentTime-startTime+startOffset));
			if(currentTime !== newTime) {
				currentTime = newTime;
				timeUpdated.dispatch(currentTime);
			}

			if(isFocused) {
				requestAnimationFrame(timeTicker);
			} else {
				setTimeout(timeTicker, 1000);
			}
		}
	}
}