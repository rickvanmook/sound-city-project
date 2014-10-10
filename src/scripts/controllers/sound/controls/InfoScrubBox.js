var	unPrefixedTransform = require('../../../utils/unPrefixedTransform'),
	domSelector = require('../../../utils/domSelector'),
	audioPlayer = require('../../../core/audio/AudioPlayer'),
	scpSignals = require('../../../core/scpSignals'),
	IS_SHOWN_CLASS = 'is-shown',
	TWEEN_BG_TIME = 0.65,
	TWEEN_INFO_TIME = 0.45,
	INFO_Y_DESTINATION = 50,//280,
	BG_Y_DESTINATION = 217;

module.exports = function(el) {

	var isInfo,
		infoEl,
		tweenInfo = {
			y:0
		},
		tweenBg = {
			y:0
		};

	this.init = function(initialIsInfo) {

		infoEl = domSelector.first(el,'sound-info');
		isInfo = initialIsInfo;

		if(isInfo) {

			tweenBg.y = 247;
			tweenInfo.y = 0;
			redrawBox();

		} else {

			tweenBg.y = BG_Y_DESTINATION;
			tweenInfo.y = INFO_Y_DESTINATION;
			redrawBox();
			el.style.opacity = 1;
		}
	};

	this.show = function() {

		el.style.opacity = 1;
		if(isInfo) {

			morphToInfo();
			infoEl.classList.add(IS_SHOWN_CLASS);

		}

	};

	this.stage = function() {


		if(isInfo) {

			morphToScrub();
		}
	};

	this.swap = function() {

		if(!isInfo) {
			morphToInfo();
		}

		isInfo = !isInfo;

		var method = isInfo ? 'add' : 'remove';
		infoEl.classList[method](IS_SHOWN_CLASS);
	};

	function morphToInfo() {
		tweenBg.y = 0;
		tweenInfo.x = 0;
		tweenInfo.y = 0;
		redrawBox();
	}

	function morphToScrub() {

		tweenBg.y = 0;
		tweenInfo.y = 0;

		TweenLite.killTweensOf(tweenBg);
		TweenLite.killTweensOf(tweenInfo);

		TweenLite.to(tweenBg, TWEEN_BG_TIME, {
			ease:Cubic.easeInOut,
			y:BG_Y_DESTINATION,
			onUpdate:redrawBox
		});

		TweenLite.to(tweenInfo, TWEEN_BG_TIME, {
			y:INFO_Y_DESTINATION,
			ease:Cubic.easeIn,
			onUpdate:redrawBox
		});
	}


	this.dispose = function() {

		TweenLite.killTweensOf(tweenBg);
		TweenLite.killTweensOf(tweenInfo);
		infoEl = null;
	};

	function redrawBox(){
		el.style[unPrefixedTransform] = 'translate3d(0,'+Math.round(tweenBg.y)+'px,0)';
		infoEl.style[unPrefixedTransform] = 'translate3d(0,'+Math.round(tweenInfo.y)+'px,0)';
	}
};