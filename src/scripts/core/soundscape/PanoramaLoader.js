var Q = require('../../libs/q'),
	imgLoader = require('../../utils/progressImgLoader'),
	scpSignals = require('../../core/scpSignals'),
	PLACEHOLDER_IMG = new Image(),
	PLACEHOLDER_IMAGES = [PLACEHOLDER_IMG, PLACEHOLDER_IMG, PLACEHOLDER_IMG, PLACEHOLDER_IMG],
	IMG_EXTENSION = '.jpg',
	LO_POSTFIX = '-lo';

module.exports = function(path) {

	var panFilesLo = PLACEHOLDER_IMAGES,
		panFilesHi = [],
		isShown = false;

	this.init = function(skipLoRes){

		if(skipLoRes) {
			isShown = true;
			return loadInitPan('');
		} else {

			return loadInitPan(LO_POSTFIX);
		}

	};

	this.show = function(){

		if(!isShown) {
			isShown = true;
			loadNextHiPan();
		}
	};

	this.dispose = function(){

		isShown = false;
		panFilesLo = null;
		panFilesHi = null;
	};

	this.getAssets = function() {

		var assets = panFilesHi.length === 4 ? panFilesHi : panFilesLo;

		return assets;
	};


	function loadInitPan(postfix) {

		var deferred = Q.defer(),
			imgProgress = [0,0,0,0];

		Q.all([
			imgLoader(path + 1 + postfix + IMG_EXTENSION),
			imgLoader(path + 2 + postfix + IMG_EXTENSION),
			imgLoader(path + 3 + postfix + IMG_EXTENSION),
			imgLoader(path + 4 + postfix + IMG_EXTENSION)
		]).then(function(imgs){

				var isUpdate = false;

				if(postfix === LO_POSTFIX) {

					panFilesLo = imgs;
				} else {

					panFilesHi = imgs;
				}

				scpSignals.panoramaUpdated.dispatch(panFilesLo, isUpdate);
				deferred.resolve();

			}).progress(function(progress){


				var totalProgress = 0;

				imgProgress[progress.index] = progress.value;
				imgProgress.forEach(function(p){
					totalProgress += p/4;
				});

				deferred.notify(totalProgress);
			});


		return deferred.promise;
	}

	function loadNextHiPan() {

		var panFilesHiCount = panFilesHi.length;
		if(panFilesHiCount !== 4) {

			return imgLoader(path + (panFilesHiCount+1) + IMG_EXTENSION)
				.then(function(img){

					if(isShown) {
						panFilesHi.push(img);
						loadNextHiPan();
					} else {
						panFilesHi = null;
					}
				});
		} else {

			var isUpdate = true;
			scpSignals.panoramaUpdated.dispatch(panFilesHi, isUpdate);
		}
	}

};
