// from http://diveintohtml5.info/everything.html#audio

var a = document.createElement('audio'),
	supportsVorbis = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')),
	supportsAAC = !!(a.canPlayType && a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));

exports.vorbis = supportsVorbis;
exports.AAC = supportsAAC;