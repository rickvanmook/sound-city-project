var Q = require('../libs/q');

module.exports = function(url, mType, img) {

	var deferred = Q.defer(),
		progress = 0,
		mType = mType || 'image/jpg',
		img = img || new Image();

	img.addEventListener('load', onImgLoad, true);

	img.load = function(url){

		var xmlHTTP = new XMLHttpRequest();
		xmlHTTP.open('GET', url,true);
		xmlHTTP.responseType = 'arraybuffer';
		xmlHTTP.onload = function(e) {

			var h = xmlHTTP.getAllResponseHeaders(),
				m = h.match( /^Content-Type\:\s*(.*?)$/mi ),
				mimeType = m[ 1 ] || mType;

			var blob = new Blob([this.response], {type:mimeType});
			img.src = window.URL.createObjectURL(blob);
		};
		xmlHTTP.onprogress = function(e) {
			progress = e.loaded / e.total;
			deferred.notify(progress);

		};
		xmlHTTP.onloadstart = function() {
			progress = 0;
			deferred.notify(0);
		};
		xmlHTTP.send();
	};

	img.load(url);

	function onImgLoad() {

		img.removeEventListener('load', onImgLoad);

		deferred.resolve(img);
		img = null;
	}


	return deferred.promise;
}

