var AjaxRequest = require('./AjaxRequest'),
	Q = require('../libs/q'),
	FEED_URL = 'data/instagram.json',
	feed = [];


module.exports = function() {

	if(feed.length) {

		var deferred = Q.defer();
		deferred.resolve(feed);
		return deferred.promise;

	} else {

		return new AjaxRequest(FEED_URL, {isJSON:true})
			.then(function(result){

				feed = result;

				return feed;
			})
	}
};