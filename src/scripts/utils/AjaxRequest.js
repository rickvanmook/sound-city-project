var Q = require('../libs/q');

module.exports = function(url, settings) {

	if(!settings) {
		settings = {};
	}

	var deferred = Q.defer(),
		request = new XMLHttpRequest(),
		method = settings.method || 'GET';


    // needs to be open before responseType is set
	request.open(method, url, true);

    if(settings.responseType) {
            request.responseType = settings.responseType;
    }


	request.onreadystatechange = function() {

		var response;

		if(request.readyState === 4) {

			if(request.status === 200) {

				response = request.response;
				if(settings.isJSON === true) {

					response = JSON.parse(response);
				}

				deferred.resolve(response);
			} else {
				deferred.reject(new Error(request));
			}
		}
	};

	if(settings.params) {
		request.setRequestHeader('Content-length', settings.params.length);
	}

	request.send(settings.params);

	return deferred.promise;
};