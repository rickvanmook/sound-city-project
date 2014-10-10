var domSelector = require('../../utils/domSelector'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform'),
	imgLoader = require('../../utils/imgLoader');


module.exports = function(el, menuEl, slideIndex) {

	var currentProgress,
		loadTween = {o:0},
		bgEl = domSelector.first(el, 'about-carousel-bg'),
		copyEl = domSelector.first(el, 'about-carousel-copy'),
		dividerEl = domSelector.first(el, 'about-carousel-divider'),
		isLoading = false;

	bgEl.style.opacity = 0;

	this.update = function(progress) {

		var newProgress = Math.min(slideIndex+1, Math.max(slideIndex, progress)) % 1;

		if(newProgress !== currentProgress) {
			currentProgress = newProgress;
			redraw();
		}
	};

	this.dispose = function() {
		bgEl = null;
		copyEl = null;
		dividerEl = null;
	};

	function redraw() {

		var COPY_OFFSET = -35,
			BG_OFFSET = -15,
			DIVIDER_OFFSET = 10,
			menuElX,
			subprogress,
			opacity,
			copyX,
			dividerX,
			bgX;

		if(currentProgress < 0.5) {

			// fade in
			subprogress = currentProgress / 0.5;
			menuElX = -100+subprogress*100;
			opacity = subprogress;
			copyX = -COPY_OFFSET * (1-subprogress);
			bgX = -BG_OFFSET * (1-subprogress);
			dividerX = -DIVIDER_OFFSET * (1-subprogress);

		} else if(currentProgress > 0.5) {

			// fade out
			subprogress = (currentProgress-0.5) / 0.5;
			menuElX = 100 * subprogress;
			opacity = 1 - subprogress;
			copyX = (COPY_OFFSET * subprogress);
			bgX = (BG_OFFSET * subprogress);
			dividerX = (DIVIDER_OFFSET * subprogress);

		} else {

			// completely visible
			opacity = 1;
			menuElX = 0;
			bgX = 0;
			dividerX = 0;
			copyX = 0;
		}

		if(opacity > 0 && !isLoading) {
			isLoading = true;
			loadBg();
		}


		menuEl.style[unPrefixedTransform] = 'translate3d('+Math.round(menuElX)+'%,0,0)';
		el.style.opacity = opacity;
		bgOpacity();
		el.style[unPrefixedTransform] = 'translate3d('+Math.round(bgX)+'px,0,0)';
		copyEl.style[unPrefixedTransform] = 'translate3d('+Math.round(copyX)+'px,0,0)';
		dividerEl.style[unPrefixedTransform] = 'translate3d('+Math.round(dividerX)+'px,0,0)';
	}

	function loadBg(){

		var  url = 'assets/images/about/'+bgEl.getAttribute('data-url');

		imgLoader(url).then(function(){
			bgEl.style.backgroundImage = 'url('+url+')';
			TweenLite.to(loadTween, 0.5, {o:1, onUpdate:bgOpacity});
		});
	}

	function bgOpacity() {

		bgEl.style.opacity = Math.min(loadTween.o, el.style.opacity);
	}
};



