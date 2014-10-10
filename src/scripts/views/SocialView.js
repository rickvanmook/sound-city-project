var Q = require('../libs/q'),
	analytics = require('../utils/analytics'),
	AjaxRequest = require('../utils/AjaxRequest'),
	audioFilter = require('../core/audio/AudioFilter'),
    domSelector = require('../utils/domSelector'),
    ShareTile = require('../controllers/share/ShareTile'),
	API_ENDPOINT = 'data/socialCount.json';


module.exports = function() {


	var shareEl,
		shareCountEls,
		shareOpenEl,
		shareCloseEl,
        shareTiles = [];

	this.init = function() {

		var deferred = Q.defer(),
            shareShapeEls;

		shareEl = domSelector.first(document, 'share');
		shareCountEls = domSelector.all(document, 'share-count');
		shareOpenEl = domSelector.first(document, 'nav-share');
		shareCloseEl = domSelector.first(shareEl, 'share-close');


		shareOpenEl.addEventListener('click', onShowClick, false);
        shareShapeEls = domSelector.all(shareEl, 'share-shape');


		new AjaxRequest(API_ENDPOINT,{isJSON:true})
			.then(function(result){
				var shareCountEl = domSelector.first(document, 'js-shareTotalCount');

				shareCountEl.innerHTML = result.total;

				shareCountEls[0].innerHTML = result.twitter;
				shareCountEls[1].innerHTML = result.facebook;
				shareCountEls[2].innerHTML = result.google;

				shareShapeEls.forEach(function(shareShapeEl, index){
					shareShapeEl.addEventListener('click', onShareTileClick, false);
					shareTiles.push(new ShareTile(shareShapeEl, index));
				});

				deferred.resolve();
			});


		return deferred.promise;
	};

	function onShareTileClick(e) {

		var className = this.className.replace('share-shape share-shape--','');

		switch(className) {
			case 'twitter': analytics.trackEvent('click', 'share', 'twitter'); break;
			case 'facebook': analytics.trackEvent('click', 'share', 'facebook'); break;
			case 'gplus': analytics.trackEvent('click', 'share', 'google+'); break;
		}
	}

	function onShowClick(e) {
		
		e.preventDefault();

		analytics.trackPageView('/share/');

		shareOpenEl.removeEventListener('click', onShowClick);
		shareCloseEl.addEventListener('click', onCloseClick, false);

		shareEl.classList.add('is-shown');
		audioFilter.muffleSocialSound();
        return tileGroupTask('show', 0.3, 0.1);
	}
	

	function onCloseClick(e) {

		e.preventDefault();

		analytics.trackPageView(analytics.getCurrentPage());

		shareCloseEl.removeEventListener('click', onCloseClick);
		shareOpenEl.addEventListener('click', onShowClick, false);

        return tileGroupTask('hide', 0, 0.1)
            .then(function(){

		        audioFilter.clearSocialSound();
		        shareEl.classList.remove('is-shown');
            });
	}


    function tileGroupTask(method, delay, delayFactor) {

        var taskList = [];

        shareTiles.forEach(function(shareTile, index){

            taskList.push(shareTile[method](delay + index*delayFactor));
        });

        return Q.all(taskList);
    }

};