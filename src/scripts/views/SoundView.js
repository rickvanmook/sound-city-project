var Q = require('../libs/q'),
	SoundViewSwitcher = require('../controllers/sound/SoundViewSwitcher'),
    domSelector = require('../utils/domSelector'),
    Factory = require('../core/Factory'),
	templates = require('../partials/templates');

module.exports = function(parent) {


	var el,
		soundViewSwitcher,
        factory;

	this.init = function() {

		el = document.createElement('div');
		el.className = 'content';
		el.innerHTML = templates.soundTemplate;

		factory = new Factory(el);
        parent.appendChild(el);

        return factory.init()
			.then(function() {
				var soundEl = domSelector.first(el, 'sound');
		        
				soundViewSwitcher = new SoundViewSwitcher(soundEl);
				return soundViewSwitcher.init();
			})
            .then(function(){
                document.body.offsetHeight;
            });
	};

	this.quickShow = function() {
		return factory.quickShow()
			.then(soundViewSwitcher.quickShow);
	};

    this.show = function(){
	    return factory.show()
		    .then(soundViewSwitcher.show);
    };

	this.hide = function() {
		return factory.hide()
			.then(soundViewSwitcher.hide);
	};

	this.dispose = function(){

		var deferred = Q.defer();

		factory.dispose()
			.then(soundViewSwitcher.dispose)
			.then(function(){

				el.parentNode.removeChild(el);
				soundViewSwitcher = null;
				factory = null;
				el = null;

				deferred.resolve();
		});

		return deferred.promise;
	};
};