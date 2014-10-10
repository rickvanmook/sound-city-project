var Signal = require('../libs/signals');


exports.aboutScrolled = new Signal();

exports.loadProgressUpdated = new Signal();

exports.timeUpdated = new Signal();
exports.loadedUpdated = new Signal();

exports.rotationUpdated = new Signal();
exports.playPauseUpdated = new Signal();
exports.windowResized = new Signal();
exports.windowFocusChanged = new Signal();

exports.preSoundViewSwap = new Signal();

exports.panoramaUpdated = new Signal();
exports.soundDataUpdated = new Signal();

exports.locationDataUpdated = new Signal();
exports.locationDataLoaded = new Signal();