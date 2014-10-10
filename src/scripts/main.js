function startApp() {
	console.log('Hi there, I think you\'re looking for this:', 'https://github.com/rvmook/sound-city-project/');
	require('./utils/polyfills/requestAnimationFrame');
	require('./core/audio/AudioSetup');
	require('./core/SoundScapeManager');

	var Q = require('./libs/q'),
		scpSignals = require('./core/scpSignals'),
		stateMachine = require('./core/StateMachine');

	window.noop = function(){};
	window.addEventListener('resize', onResize, false);
	window.addEventListener('blur', onBlur, false);
	window.addEventListener('focus', onFocus, false);

	stateMachine.init();

	function onBlur() {
		scpSignals.windowFocusChanged.dispatch(false);
	}

	function onFocus() {
		scpSignals.windowFocusChanged.dispatch(true);
	}

	function onResize() {

		scpSignals.windowResized.dispatch();
	}
}
window.startApp = startApp;
