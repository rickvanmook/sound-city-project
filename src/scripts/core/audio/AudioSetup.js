var audioRotator = require('./AudioRotator'),
	audioFilter = require('./AudioFilter'),
	scpSignals = require('../scpSignals'),
	audioContext = require('../../utils/centralAudioContext'),
	mainGain = audioContext.createGain(),
	merger = audioContext.createChannelMerger(2);

audioRotator.init(merger);
merger.connect(mainGain);
audioFilter.init(mainGain);