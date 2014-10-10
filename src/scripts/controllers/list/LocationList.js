var Q = require('../../libs/q'),
    domSelector = require('../../utils/domSelector'),
	PlayPause = require('../sound/controls/PlayPause'),
    imgLoader = require('../../utils/imgLoader'),
    unPrefixedTransform = require('../../utils/unPrefixedTransform'),
    dataManager = require('../../core/DataManager'),
    scpSignals = require('../../core/scpSignals'),
	body = document.body,
    ITEM_HEIGHT = 201,
    SCROLL_STEP = 20,
    PADDING = 250,
    CITY_ID = 'CITY_ID',
	ACTIVE_MASK = 'ACTIVE_MASK',
    LOCATION_ID = 'LOCATION_ID',
    THUMB_PATH = 'data/soundscapes/' + CITY_ID + '/' + LOCATION_ID + '/thumb.jpg',
    LIST_CLASS = 'list-location ',
    IS_ACTIVE_CLASS = 'is-active',
    PLAY_PAUSE_MARKUP = '<div class="list-location-box box"><svg x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50">' +
	    '<defs>'+
		    '<clipPath id="scpMaskLOCATION_ID">'+
			    '<rect class="playPause-mask" fill="green" x="0" y="0" width="70" height="70" transform="rotate(45) translate(35, -35) scale(ACTIVE_MASK,1)"></rect>'+
			    '<rect class="playPause-mask" fill="red" x="0" y="0" width="70" height="70" transform="rotate(135) translate(-35, -35) scale(1,ACTIVE_MASK)"></rect>'+
		    '</clipPath>'+
	    '</defs>'+
	    '<path class="list-location-path" fill="none" stroke="#b59e5c" d="M0.5,0.5L0.5,49.5 49.5,49.5"></path>' +
        '<path class="list-location-path" fill="none" stroke="#b59e5c" d="M49.5,49.5L49.5,0.5 0.5,0.5"></path>' +
	    '<g clip-path="url(#scpMaskLOCATION_ID)">'+
		    '<rect class="sound-playPause-pause" fill="#fff" y="19" x="20" width="3" height="12"></rect>'+
			'<rect class="sound-playPause-pause" fill="#fff" y="19" x="27" width="3" height="12"></rect>'+
	        '<path class="sound-playPause-play" fill="#fff" d="M20,19L30,25.5 20,31 20,19"></path>'+
	    '</g>'+
	    '</svg>' +
        '</div>',
    LIST_MARKUP = '<li class="CLASS">' +
	    '<div class="list-location-bg" data-src="SRC"></div>'+
		    PLAY_PAUSE_MARKUP+
		    '<a target="_self" class="list-location-copy">NAME</a>' +
		    '<div class="list-location-number">NUMBER</div>' +
	    '</div>' +
	    '<div class="list-location-hitfield"></div>'+
	    '</li>';


module.exports = function(el) {

    var thumbHitfieldEls = [],
	    playPauseBoxes = [],
        bgEls = [],
        isDrawing = false,
        minY = 0,
        velTween = {v:0},
        curVelocity = 0,
        destVelocity = 0,
        translateY = 0,
	    isTouch,
        clientY,
        windowHeight,
        elHeight;

    this.init = function() {

	    isTouch = document.body.classList.contains('is-touch');

	    if(isTouch) {

	    } else {

            el.addEventListener('mousemove', onMouseMove, false);
	    }

        scpSignals.locationDataUpdated.add(onLocationDataUpdated);
        scpSignals.windowResized.add(onWindowResize);
    };

    function onWindowResize() {

        var newWindowHeight = body.offsetHeight,
            newElHeight = el.offsetHeight;

        if(!isTouch && (newElHeight !== elHeight || newWindowHeight !== windowHeight)) {

            windowHeight = newWindowHeight;
            elHeight = newElHeight;
            minY = Math.round(windowHeight - elHeight);
            recalculateVelocity();
        }
    }

    function onThumbHitfieldElClick(e) {

        dataManager.updateIndex(this.locationIndex);
        location.hash = '#/';
    }

    function onMouseMove(e) {
        clientY = e.clientY;
        
        recalculateVelocity();
    }

    function recalculateVelocity() {

        var newVelocity;

        if(clientY < PADDING) {

            newVelocity = SCROLL_STEP * (1-clientY/PADDING);

        } else if(clientY > windowHeight-PADDING) {
            newVelocity = -SCROLL_STEP * (1-(windowHeight-clientY)/PADDING);
        } else {

            newVelocity = 0;
        }

        newVelocity = Math.round(newVelocity*100)/100;

        if(destVelocity !== newVelocity) {

            destVelocity = newVelocity;

            TweenLite.to(velTween, 0.55, {
                ease:Cubic.easeOut,
                v:destVelocity,
                onUpdate:function(){
                    curVelocity = velTween.v;
                }
            });

            if(!isDrawing) {
                redraw();
            }
        }
    }


    function redraw() {

        var isAtBottom = false,
            isAtTop = false;

        isDrawing = true;

        var newTranslateY = translateY + curVelocity;

        if(newTranslateY <= minY) {

            newTranslateY = minY;
            isAtBottom = true;
            
        } else if(newTranslateY >= 0) {

            newTranslateY = 0;
            isAtTop = true;
        }

        if(newTranslateY !== translateY) {

//            translateEl(easing(newTranslateY / minY)*minY);
            translateEl(newTranslateY);
        }

        if(curVelocity !== destVelocity || destVelocity !== 0) {


            if(isAtBottom && curVelocity < 0) {

                stopDrawing();
            } else if(isAtTop && curVelocity > 0) {

                stopDrawing();
            } else {

                requestAnimationFrame(redraw);
            }

        } else {

            stopDrawing();
        }
    }

    function translateEl(newTranslateY) {

        translateY = Math.min(0,Math.max(minY,Math.round(newTranslateY)));
        el.style[unPrefixedTransform] = 'translate3d(0,' + translateY + 'px,0)';
    }

    function stopDrawing() {

        TweenLite.killTweensOf(velTween);
        destVelocity = 0;
        curVelocity = 0;
        isDrawing = false;
    }


    function onLocationDataUpdated(newLocation) {

	    var parentEl,
		    containsIsActiveClass;

        thumbHitfieldEls.forEach(function(thumbHitfieldEl) {

	        parentEl = thumbHitfieldEl.parentElement;
	        containsIsActiveClass = parentEl.classList.contains(IS_ACTIVE_CLASS);

            if(thumbHitfieldEl.locationIndex === newLocation.index) {

	            if(!containsIsActiveClass) {

		            parentEl.classList.add(IS_ACTIVE_CLASS);
	                maskPlayPauseIcon(parentEl, true);
	            }

            } else if(containsIsActiveClass) {

	            parentEl.classList.remove(IS_ACTIVE_CLASS);
	            maskPlayPauseIcon(parentEl, false);
            }



        });

    }

    this.show = function(requestedCityId) {

        el.classList.add('is-shown');
        clientY = windowHeight/2;
        var cityId;
        if(typeof requestedCityId === 'string') {
            cityId = requestedCityId;
        } else {
            cityId = dataManager.getCurrentLocation().cityId;
        }
        update(cityId);
    };

    this.hide = function() {
        el.classList.remove('is-shown');
    };

    function update(cityId) {

        var currentLocation = dataManager.getCurrentLocation(),
            locationList = dataManager.getLocationList(cityId),
            html = '',
            listOffset = 0,
	        maskScale,
	        playPauseEls,
	        playPauseBox,
            locationClass;

        locationList.forEach(function(location, index) {

            if(currentLocation.id === location.id) {

                listOffset = -index * ITEM_HEIGHT;
                locationClass = LIST_CLASS + IS_ACTIVE_CLASS;
	            maskScale = 0.135;
            } else {
                locationClass = LIST_CLASS;
	            maskScale = 0;
            }

            html += LIST_MARKUP
                .replace('SRC', THUMB_PATH.replace(CITY_ID, location.cityId))
                .replace(new RegExp(LOCATION_ID,'gm'),location.id)
                .replace(new RegExp(ACTIVE_MASK,'gm'),maskScale)
                .replace('CLASS', locationClass)
                .replace('NUMBER', location.number)
                .replace('NAME', location.name);
        });


        el.innerHTML = html;
        onWindowResize();
        translateEl(listOffset + windowHeight/2 - ITEM_HEIGHT/2);

        thumbHitfieldEls = domSelector.all(el, 'list-location-hitfield');
        bgEls = domSelector.all(el, 'list-location-bg');
	    playPauseEls = domSelector.all(el, 'list-location-box');


	    thumbHitfieldEls.forEach(function(thumbHitfieldEl, index) {
		    thumbHitfieldEl.locationIndex = locationList[index].index;
		    thumbHitfieldEl.addEventListener('click', onThumbHitfieldElClick, false);
	    });

	    playPauseEls.forEach(function(playPauseEl) {
		    playPauseBox = new PlayPause(playPauseEl);
		    playPauseBox.init();
		    playPauseBoxes.push(playPauseBox);
	    });


        loadNextThumb(0);
    }

    function disposeThumbHitfieldEls() {
        var thumbHitfieldEl,
	        playPauseBox;

        while(thumbHitfieldEls.length) {
            thumbHitfieldEl = thumbHitfieldEls.pop();
            thumbHitfieldEl.locationIndex = null;
            thumbHitfieldEl.removeEventListener('click', onThumbHitfieldElClick);
            thumbHitfieldEl = null;
        }

	    while(playPauseBoxes.length) {

		    playPauseBox = playPauseBoxes.pop();
		    playPauseBox.dispose();
		    playPauseBox = null;
	    }
    }

    this.dispose = function() {

        disposeThumbHitfieldEls();
        stopDrawing();
        el.removeEventListener('mousemove', onMouseMove);
        scpSignals.locationDataUpdated.remove(onLocationDataUpdated);
    };

    function loadNextThumb(index) {

        if(bgEls[index]) {

            lazyLoadBg(bgEls[index])
                .then(function(){
                    loadNextThumb(index+1);
                });
        }
    }
};

function maskPlayPauseIcon(containerEl, isMaksed) {


	var maskEls = domSelector.all(containerEl, 'playPause-mask'),
		tweenObj = {},
		destination,
		delay;

	if(isMaksed) {

		tweenObj.scale = 0;
		delay = 0.7;
		destination = 0.135;

	} else {

		tweenObj.scale = 0.135;
		delay = 0;
		destination = 0;

	}

	TweenLite.to(tweenObj, 0.35, {
		ease:Cubic.easeOut,
		delay:delay,
		scale:destination,
		onUpdate:function(){

			maskEls[0].setAttribute('transform','rotate(45) translate(35, -35) scale('+tweenObj.scale+',1)');
			maskEls[1].setAttribute('transform','rotate(135) translate(-35, -35) scale(1,'+tweenObj.scale+')');
		}
	});

}

function lazyLoadBg(el) {

    var url = el.getAttribute('data-src');

    el.classList.add('is-loading');

    return imgLoader(url)
        .then(function(img){
            el.classList.remove('is-loading');
            el.classList.add('is-loaded');
            el.style.backgroundImage = 'url(' + url + ')';
        });
}