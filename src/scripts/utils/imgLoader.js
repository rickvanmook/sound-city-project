var Q = require('../libs/q');

module.exports = function(url, img) {

	var deferred = Q.defer();

	if(!img) {

		img = new Image();
	}

	img.addEventListener('load', onImgLoad, true);
	img.src = url;

	function onImgLoad() {

		img.removeEventListener('load', onImgLoad);

		deferred.resolve(img);
		img = null;
	}


	return deferred.promise;
}