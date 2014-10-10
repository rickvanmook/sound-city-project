var Q = require('../../libs/q'),
    domSelector = require('../../utils/domSelector'),
    Signal = require('../../libs/signals'),
    unPrefixedTransform = require('../../utils/unPrefixedTransform'),
    RIGHT_TO_LEFT = 1,
    LEFT_TO_RIGHT = -1,
    HOVER_MASK_TIME = 0.3,
    COPY_TIME = 0.5,
    MASK_TIME = 0.45,
    IS_ACTIVE_CLASS = 'is-active';

module.exports = function(cityId) {

    var tweens = {
            scaleX:0,
            hoverX:-100,
            copyX:100
        },
        isFocused,
        isActive,
        clicked = new Signal(),
        hoverMaskEl,
        maskedCopyEl,
        mainEl,
        maskEl;

    this.cityId = cityId;
    this.clicked = clicked;
    this.init = function(el, initActive) {
        mainEl = el;
        hoverMaskEl = domSelector.first(el, 'list-city-hoverMask');
        maskedCopyEl = domSelector.first(el, 'list-city-masked');
        maskEl = domSelector.first(el, 'list-city-mask');
        isActive = initActive;

        if(isActive) {
            maskEl.classList.add(IS_ACTIVE_CLASS);
            mainEl.classList.add(IS_ACTIVE_CLASS);
            maskedCopyEl.classList.add(IS_ACTIVE_CLASS);
        }
    };

    function onMouseOver() {
        isFocused = true;

        if(!isActive) {


            copyTween(100, HOVER_MASK_TIME)
                .then(function(){
                    maskedCopyEl.classList.add(IS_ACTIVE_CLASS);
                    hoverMaskTween(0,HOVER_MASK_TIME,0);
                    copyTween(-100, 0, 0);
                    copyTween(0, HOVER_MASK_TIME, 0);
                });
        }
    }

    function onMouseOut() {

        isFocused = false;
        if(!isActive) {

            hoverMaskTween(-100,HOVER_MASK_TIME,0);
            copyTween(-100, HOVER_MASK_TIME)
                .then(function(){
                    maskedCopyEl.classList.remove(IS_ACTIVE_CLASS);
                    copyTween(100, 0, 0);
                    copyTween(0, HOVER_MASK_TIME, 0);
                });
        }
    }

    function onClick(e) {
        if(!isActive) {
            clicked.dispatch(cityId);
        }
    }

    this.cover = cover;
    function cover(delay, isRightToLeft) {

	    mainEl.style.width = '100%';


        if(isRightToLeft) {

            updateOrigin('top right');

        } else {

            updateOrigin('top left');
        }

        return maskTween(1, delay);
    }

    this.show = function(delay, isRightToLeft) {

        copyTween(100,0,0);
        return cover(delay, isRightToLeft)
            .then(function(){
                mainEl.classList.add('is-shown');
                copyTween(0,COPY_TIME,0);
                if(isActive) {
                    hoverMaskTween(0,0,0);
                }
            });
    };

    this.hide = function(delay, isRightToLeft) {

        copyTween(-100,COPY_TIME,delay);

        return cover(delay, isRightToLeft)
            .then(function(){
                hoverMaskTween(-100,0,0);
                mainEl.classList.remove('is-shown');
            });
    };

    this.activate = function(delay, isRightToLeft) {

        hoverMaskTween(0,HOVER_MASK_TIME, 0);
        refreshCopy('add', COPY_TIME, delay, RIGHT_TO_LEFT);
        isActive = true;
        maskEl.classList.add(IS_ACTIVE_CLASS);
        return cover(delay, isRightToLeft);
    };

    this.deactivate = function(delay, isRightToLeft) {

        refreshCopy('remove', COPY_TIME, delay, RIGHT_TO_LEFT);
        isActive = false;
        maskEl.classList.remove(IS_ACTIVE_CLASS);
        return cover(delay, isRightToLeft)
            .then(function(){
                hoverMaskTween(-100,0,0);
            });
    };

    function refreshCopy(method,time,delay,direction) {

        copyTween(-100*direction,time,delay)
            .then(function(){

                maskedCopyEl.classList[method](IS_ACTIVE_CLASS);
                copyTween(100*direction,0,0);
                copyTween(0,time,0.2);
            });
    }

    this.uncover = uncover;
    function uncover(delay, isRightToLeft) {


        mainEl.style.width = '100%';

        if(isRightToLeft) {

            updateOrigin('top right');

        } else {

            updateOrigin('top left');
        }


        return maskTween(0, delay)
            .then(function(){
                mainEl.style.width = '120px';
            });
    }

    this.dispose = function() {

        TweenLite.killTweensOf(tweens);
        tweens = null;

        maskedCopyEl = null;
        maskEl = null;
        hoverMaskEl = null;

        clicked.removeAll();
        clicked = null;


        mainEl = null;
    };

    function updateOrigin(origin) {
        maskEl.style[unPrefixedTransform+'Origin'] = origin;
    }

    function copyTween(destination, time, delay) {

        var deferred = Q.defer();

        TweenLite.to(tweens, time, {
            ease:destination ? Cubic.easeIn : Cubic.easeOut,
            delay:delay,
            copyX:destination,
            onUpdate:function(){

                maskedCopyEl.style[unPrefixedTransform] = 'translateX('+tweens.copyX+'%)';
            },
            onComplete:deferred.resolve
        });

        return deferred.promise;

    }

	this.addListeners = function() {

		mainEl.addEventListener('click', onClick, false);
		mainEl.addEventListener('mouseover', onMouseOver, false);
		mainEl.addEventListener('mouseout', onMouseOut, false);
	};

	this.removeListeners = function() {

		mainEl.removeEventListener('click', onClick);
		mainEl.removeEventListener('mouseout', onMouseOut);
		mainEl.removeEventListener('mouseover', onMouseOver);
	};

    function hoverMaskTween(destination, time, delay) {

        var deferred = Q.defer();

        TweenLite.to(tweens, time, {
            ease:destination ? Cubic.easeIn : Cubic.easeOut,
            delay:delay,
            hoverX:destination,
            onUpdate:function(){
                hoverMaskEl.style[unPrefixedTransform] = 'translate3d('+tweens.hoverX+'%,0,0)';
            },
            onComplete:deferred.resolve
        });

        return deferred.promise;
    }

    function maskTween(destination, delay) {

        var deferred = Q.defer();

        TweenLite.to(tweens, MASK_TIME, {
            ease:destination ? Cubic.easeIn : Cubic.easeOut,
            delay:delay,
            scaleX:destination,
            onUpdate:function(){
                maskEl.style[unPrefixedTransform] = 'scaleX('+tweens.scaleX+')';
            },
            onComplete:deferred.resolve
        });

        return deferred.promise;

    }

};