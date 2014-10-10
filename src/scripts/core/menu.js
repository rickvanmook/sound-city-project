var domSelector = require('../utils/domSelector'),
	transitionEndEvent = require('../utils/transitionEndEvent'),
	unPrefixedTransform = require('../utils/unPrefixedTransform'),
	IS_LOADING_CLASS = 'is-loading',
	navEl = domSelector.first(document, 'nav'),
	loadingEl = domSelector.first(document, 'nav-loading'),
	navItems = domSelector.all(document, 'nav-item');


exports.update = function(viewId) {

	var viewIndex;

	if(viewId === '') {

		navEl.classList.add('has-list');
		viewIndex = 0;
	} else if(viewId === 'list') {

		navEl.classList.remove('has-list');
		viewIndex = 1;
	} else if(viewId === 'about') {

		navEl.classList.remove('has-list');
		viewIndex = 2;
	}

	setFill(navItems[0], viewIndex === 0);
	setFill(navItems[1], viewIndex === 1);
	setFill(navItems[2], viewIndex === 2);
};

exports.setPageProgress = function(progress) {

	var transform = 'scaleY(' + progress + ')';

	if(progress > 0) {
		loadingEl.classList.add(IS_LOADING_CLASS);
	}

	if(progress >= 1) {
		loadingEl.addEventListener(transitionEndEvent, onLoadingTransitionEnded, false);
		transform += ' translateY(-100%)';
	}

	loadingEl.style[unPrefixedTransform] = transform;

};


function onLoadingTransitionEnded() {
	loadingEl.removeEventListener(transitionEndEvent, onLoadingTransitionEnded);
	loadingEl.classList.remove(IS_LOADING_CLASS);
	loadingEl.style[unPrefixedTransform] = '';
}

function setFill(el, isActive) {

	var method = isActive ? 'add' : 'remove';

	el.classList[method]('is-active');
}