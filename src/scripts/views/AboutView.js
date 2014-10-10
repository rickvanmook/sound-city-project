var Q = require('../libs/q'),
	analytics = require('../utils/analytics'),
	unPrefixedTransform = require('../utils/unPrefixedTransform'),
	scpSignals = require('../core/scpSignals'),
	transitionEndEvent = require('../utils/transitionEndEvent'),
	templates = require('../partials/templates'),
	Factory = require('../core/Factory');

module.exports = function(parent) {


	var el,
		aboutTween = {y:100},
		aboutEl,
		deferred,
		factory;

	this.init = function() {

		var deferred = Q.defer();

		var aboutFadeEls;

		el = document.createElement('div');
		el.classList.add('content');
		el.innerHTML = templates.aboutTemplate;
		aboutEl = el.getElementsByClassName('about')[0];

		parent.insertBefore(el, parent.firstElementChild);

		factory = new Factory(el);

		parent.appendChild(el);

		return factory.init()
			.then(function(){
				document.body.offsetHeight;
				aboutEl.addEventListener('scroll', onAboutScroll);
			});
	};

	function onAboutScroll() {

		var boundsTop = aboutEl.scrollTop,
			boundsBottom = aboutEl.scrollTop + el.offsetHeight;

		scpSignals.aboutScrolled.dispatch(boundsTop, boundsBottom);
	}

	this.show = function() {

		analytics.setCurrentPage('/about/');

		deferred = Q.defer();
		aboutEl.classList.add('is-shown');

		TweenLite.to(aboutTween, 0.6, {
			y:0,
			ease:Cubic.easeOut,
			onUpdate:function(){
				aboutEl.style[unPrefixedTransform] = 'translate3d(0,'+aboutTween.y+'%,0)';
			},
			onComplete:function(){
				factory.show()
					.then(deferred.resolve);
			}
		});

		return deferred.promise;
	};

	this.hide = function() {

		deferred = Q.defer();

		TweenLite.to(aboutTween, 0.6, {
			y:100,
			ease:Cubic.easeInOut,
			onUpdate:function(){
				aboutEl.style[unPrefixedTransform] = 'translate3d(0,'+aboutTween.y+'%,0)';
			},
			onComplete:deferred.resolve
		});

		return deferred.promise;

	};

	this.dispose = function() {

		deferred = Q.defer();

		factory.dispose().then(function(){

			factory = null;
			el.parentNode.removeChild(el);
			el = null;
			aboutEl = null;

			deferred.resolve();
		});

		return deferred.promise;

	};


};