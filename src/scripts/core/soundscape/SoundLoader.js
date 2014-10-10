var Q = require('../../libs/q'),
	AjaxRequest = require('../../utils/AjaxRequest'),
	AudioPlayer = require('../../core/audio/AudioPlayer'),
	audioContext = require('../../utils/centralAudioContext'),
	supportsAudioFormat = require('../../utils/featureDetection/supportsAudioFormat'),
	SAMPLE_RATE = audioContext.sampleRate,
	EXTENSION_OGG = '.ogg',
	EXTENSION_M4A = '.m4a',
	AUDIO_EXTENSION = supportsAudioFormat.vorbis ? EXTENSION_OGG : EXTENSION_M4A,
	AUDIO_FILE_NUM = 5,
	CHANNELS = 4;

module.exports = function(path) {

	var buffer = audioContext.createBuffer( CHANNELS, 1, SAMPLE_RATE),
		loadCount = 0,
		isLoading = false,
		isPastIntro = false,
		isActive = false;

	this.init = function(){

		isActive = true;
		AudioPlayer.updateBuffer(buffer);

		return loadNextSound();
	};

	this.show = function(){

		AudioPlayer.playedIntro.addOnce(onPlayedIntro);

		return loadNextSound();
	};

	function onPlayedIntro() {

		isPastIntro = true;

		if(isActive) {
			loadNextSound();
		}
	}


	this.dispose = function(){
		AudioPlayer.playedIntro.remove(onPlayedIntro);
		isPastIntro = false;
		isActive = false;
		loadCount = null;
		buffer = null;
	};

	function loadNextSound() {

		if(!isLoading && loadCount < AUDIO_FILE_NUM) {

			isLoading = true;

			loadCount++;
			return soundLoader(path + loadCount + AUDIO_EXTENSION)
				.then(updateBuffer)
				.then(function(){

					isLoading = false;

					if(isActive) {
						AudioPlayer.updateBuffer(buffer);

						if(isPastIntro) {
							loadNextSound();
						}
					}
				})

		} else {

			var deferred = Q.defer();
			deferred.resolve();
			return deferred.promise;
		}
	}

	function updateBuffer(newBuffers) {

		if(buffer !== null) {
			buffer = appendBuffer(buffer, newBuffers);
		}
	}
}


/*****************************
 * LOADING AND PARSING UTILS *
 *****************************/

function soundLoader(url) {


	var deferred = Q.defer(),
		taskList = [],
		progresses = [0,0],
		urls;

	if(AUDIO_EXTENSION === EXTENSION_M4A) {
		urls = [
			url.replace(AUDIO_EXTENSION, 'A'+AUDIO_EXTENSION),
			url.replace(AUDIO_EXTENSION, 'B'+AUDIO_EXTENSION)
		];

	} else {

		urls = [url];
	}

	for(var i = 0; i < urls.length; i++) {
		taskList.push(loadAudio(urls[i]).then(decodeAudio));
	}



	Q.all(taskList)
		.then(function(buffers){
			deferred.resolve(buffers);
		},
		noop,
		function(progress){
			var totalProgress = 0,
				urlCount = urls.length;
			progresses[progress.index] = progress.value;

			progresses.forEach(function(p){
				totalProgress += p/urlCount;
			});

			deferred.notify(totalProgress);
		});

	return deferred.promise;
}

function appendBuffer(buffer, newBuffers) {

	var bufferNum = newBuffers.length,
		channelCount = 0,
		newBufferLength = 0;

	for(var i = 0; i < bufferNum; i++) {

		newBufferLength = Math.max(newBufferLength, newBuffers[i].length);
	}


	var tmpBuffer = audioContext.createBuffer( CHANNELS, (buffer.length + newBufferLength), SAMPLE_RATE );

	newBuffers.forEach(function(newBuffer){

		for (var i = 0; i < newBuffer.numberOfChannels; i++, channelCount++) {

			var channel = tmpBuffer.getChannelData(channelCount);

			channel.set(buffer.getChannelData(channelCount), 0);
			channel.set(newBuffer.getChannelData(i), buffer.length);
		}
	});


	return tmpBuffer;
}


function loadAudio(url) {

	return new AjaxRequest(url,{responseType:'arraybuffer'});
}

function decodeAudio(audioArray) {

	var deferred = Q.defer();

	audioContext.decodeAudioData(audioArray, function(buffer) {

		deferred.resolve(buffer);

	}, function(e){
		throw new Error('Can\'t decode audio');
	});

	return deferred.promise;
}