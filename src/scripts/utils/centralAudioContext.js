var AudioContext = (window.AudioContext || window.webkitAudioContext || null),
	audioContext = new AudioContext();

module.exports = audioContext;