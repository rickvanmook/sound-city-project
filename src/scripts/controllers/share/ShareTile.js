var Q = require('../../libs/q'),
    animationEndEvent = require('../../utils/animationEndEvent'),
    unPrefixedTransform = require('../../utils/unPrefixedTransform'),
    domSelector = require('../../utils/domSelector'),

    ODD_LENGTH = 331,
    EVEN_LENGTH = 350,

    PRE_TRANSFORM = 'rotate(-45 0 118) translate(0 ',
    TRANSLATE_SHOW = 84,
    TRANSLATE_HIDE = 170,

    PATH_TWITTER = 'M140.1,104.9c-1.6,0.7-3.2,1.2-5,1.4c1.8-1.1,3.2-2.8,3.8-4.8c-1.7,1-3.5,1.7-5.5,2.1 c-1.6-1.7-3.8-2.7-6.3-2.7c-4.8,0-8.7,3.9-8.7,8.7c0,0.7,0.1,1.3,0.2,2c-7.2-0.4-13.6-3.8-17.8-9c-0.7,1.3-1.2,2.8-1.2,4.4 c0,3,1.5,5.7,3.9,7.2c-1.4,0-2.8-0.4-3.9-1.1c0,0,0,0.1,0,0.1c0,4.2,3,7.7,6.9,8.5c-0.7,0.2-1.5,0.3-2.3,0.3c-0.6,0-1.1-0.1-1.6-0.2 c1.1,3.4,4.3,5.9,8.1,6c-3,2.3-6.7,3.7-10.8,3.7c-0.7,0-1.4,0-2.1-0.1c3.8,2.5,8.4,3.9,13.3,3.9c15.9,0,24.6-13.2,24.6-24.6 c0-0.4,0-0.7,0-1.1C137.5,108.2,138.9,106.6,140.1,104.9z',
    PATH_GPLUS = 'M103.5,109.9c0,3.1,1,5.3,3,6.6c1.7,1.1,3.6,1.2,4.6,1.2c0.2,0,0.4,0,0.6,0c0,0-0.3,2.1,1.2,4.1l-0.1,0 c-2.6,0-11.3,0.6-11.3,7.7c0,7.2,7.9,7.6,9.5,7.6c0.1,0,0.2,0,0.2,0c0,0,0.1,0,0.3,0c1,0,3.7-0.1,6.1-1.3c3.2-1.5,4.8-4.2,4.8-8 c0-3.6-2.5-5.8-4.3-7.4c-1.1-1-2-1.8-2-2.6c0-0.8,0.7-1.4,1.6-2.2c1.4-1.3,2.8-3.1,2.8-6.5c0-3-0.4-5-2.8-6.3 c0.3-0.1,1.1-0.2,1.6-0.3c1.3-0.2,3.2-0.4,3.2-1.4v-0.2h-9.5C113,100.9,103.5,101.3,103.5,109.9z M118.8,128.5c0.2,2.9-2.3,5-6,5.3 c-3.8,0.3-6.9-1.4-7.1-4.3c-0.1-1.4,0.5-2.7,1.7-3.8c1.2-1.1,2.9-1.8,4.7-1.9c0.2,0,0.4,0,0.6,0 C116.3,123.7,118.6,125.7,118.8,128.5z M116.3,108c0.9,3.3-0.5,6.7-2.7,7.3c-0.3,0.1-0.5,0.1-0.8,0.1c-2,0-4.1-2.1-4.8-4.9 c-0.4-1.6-0.4-3,0.1-4.3c0.5-1.3,1.3-2.2,2.4-2.5c0.3-0.1,0.5-0.1,0.8-0.1C113.8,103.5,115.3,104.5,116.3,108z M132.3,115.1v-6.2 h-3.9v6.2h-6.2v3.9h6.2v6.2h3.9V119h6.2v-3.9H132.3z',
    PATH_FACEBOOK = 'M130.2,104.9h-6.4c-0.8,0-1.6,1-1.6,2.3v4.6h8v6.6h-8v19.8h-7.5v-19.8h-6.8v-6.6h6.8v-3.9 c0-5.6,3.9-10.1,9.1-10.1h6.4V104.9z',

    TEMPLATE = '<svg width="236px" height="236px" viewBox="0 0 236 236">'+
        '<path fill="none" class="share-path share-path--default" stroke="#dfdfdf" d="M234.9,118L231.7,114.7 121.3,225.2 118,221.9 114.8,225.2 4.3,114.7 1.1,118 "></path>'+
        '<path fill="none" class="share-path share-path--default" stroke="#dfdfdf" d="M221.9,118L228.4,124.5 124.5,228.4 121.3,225.2 114.7,231.7 118,234.9 121.3,231.7 114.8,225.2 111.5,228.4 7.6,124.5 14.1,118 "></path>'+
        '<path fill="none" class="share-path share-path--default" stroke="#dfdfdf" d="M1.1,118L4.3,121.3 114.7,10.8 118,14.1 121.2,10.8 231.7,121.3 234.9,118 "></path>'+
        '<path fill="none" class="share-path share-path--default" stroke="#dfdfdf" d="M14.1,118L7.6,111.5 111.5,7.6 114.7,10.8 121.3,4.3 118,1.1 114.7,4.3 121.2,10.8 124.5,7.6 228.4,111.5 221.9,118 "></path>'+

        '<defs>'+
            '<clipPath id="scpMask##ID##">'+
                '<rect class="share-shape-mask" fill="green" x="-2" y="116" width="170" height="170" transform="'+PRE_TRANSFORM+'-170)"></rect>'+
                '<rect class="share-shape-mask" fill="green" x="-2" y="116" width="170" height="170" transform="'+PRE_TRANSFORM+'170)"></rect>'+
            '</clipPath>'+
        '</defs>'+
        '<path class="share-logo" fill="#b59e5c" d="##NETWORK_PATH##"/>'+
        '<g clip-path="url(#scpMask##ID##)">'+
            '<path fill="#b59e5c" d="M231.7,122.3l4.3-4.3l-4.3-4.3l-3.3,3.3l-2.2-2.2l3.3-3.3l-105-105l-3.3,3.3l-2.2-2.2l3.3-3.3L118,0 l-4.3,4.3l3.3,3.3l-2.2,2.2l-3.3-3.3l-105,105l3.3,3.3l-2.2,2.2l-3.3-3.3L0,118l4.3,4.3l3.3-3.3l2.2,2.2l-3.3,3.3l105,105l3.3-3.3 l2.2,2.2l-3.3,3.3l4.3,4.3l4.3-4.3l-3.3-3.3l2.2-2.2l3.3,3.3l105-105l-3.3-3.3l2.2-2.2L231.7,122.3z M231.7,115.8l2.2,2.2l-2.2,2.2 l-2.2-2.2l0,0l0,0L231.7,115.8z M124.5,8.6l102.9,102.9l-2.2,2.2L122.3,10.8L124.5,8.6z M115.8,4.3l2.2-2.2l2.2,2.2L118,6.5l0,0 l0,0L115.8,4.3z M118,8.7L118,8.7L118,8.7l2.2,2.2L118,13l-2.2-2.2L118,8.7z M8.6,111.5L111.5,8.6l2.2,2.2L10.9,113.7L8.6,111.5z M4.3,120.2L2.1,118l2.2-2.2l2.2,2.2l0,0l0,0L4.3,120.2z M8.7,118L8.7,118L8.7,118l2.2-2.2L13,118l-2.2,2.2L8.7,118z M111.5,227.4 L8.6,124.5l2.2-2.2l102.9,102.9L111.5,227.4z M120.2,231.7l-2.2,2.2l-2.2-2.2l2.2-2.2l0,0l0,0L120.2,231.7z M118,227.3L118,227.3 L118,227.3l-2.2-2.2l2.2-2.2l2.2,2.2L118,227.3z M227.4,124.5L124.5,227.4l-2.2-2.2l102.8-102.8L227.4,124.5z M225.2,120.2L223,118 l2.2-2.2l2.2,2.2l0,0l0,0L225.2,120.2z"/>'+
            '<path fill="#fff" d="##NETWORK_PATH##"/>'+
        '</g>'+
    '</svg>';

module.exports = function(el, id) {

    var networkPath;
    switch(id) {
        case 0: networkPath = PATH_TWITTER; break;
        case 1: networkPath = PATH_FACEBOOK; break;
        case 2: networkPath = PATH_GPLUS; break;
    }

    // add svg template
    el.innerHTML = el.innerHTML + TEMPLATE.replace(new RegExp('##ID##','gm'),id)
        .replace(new RegExp('##NETWORK_PATH##','gm'),networkPath);


    var lineTweens = [
            {offset:ODD_LENGTH},
            {offset:EVEN_LENGTH},
            {offset:ODD_LENGTH},
            {offset:EVEN_LENGTH}
        ],
        shareLogoEl = domSelector.first(el, 'share-logo'),
        shareCountEl = domSelector.first(el, 'share-count'),
        sharePathEls = domSelector.all(el, 'share-path'),
        maskTween = {
            translate:TRANSLATE_HIDE
        },
        shareShapeMaskEls = domSelector.all(el, 'share-shape-mask');


    this.show = function(delay) {

        TweenLite.killDelayedCallsTo(hideContent);
        TweenLite.delayedCall(0.3+delay, showContent);

        Q.all([
            tweenShapeLine(0, 0, delay),
            tweenShapeLine(1, 0, delay + 0.075),
            tweenShapeLine(2, 0, delay),
            tweenShapeLine(3, 0, delay + 0.075)
        ]).then(setListeners);
    };

    function showContent() {
        shareLogoEl.classList.add('is-shown');
        shareCountEl.classList.add('is-shown');
    }

    function hideContent() {
        shareLogoEl.classList.remove('is-shown');
	    shareCountEl.classList.remove('is-shown');
    }

    this.hide = function(delay) {

        TweenLite.killDelayedCallsTo(showContent);
        TweenLite.delayedCall(delay+0.3, hideContent);
        removeListeners();

        Q.all([
            tweenShapeLine(0, ODD_LENGTH, delay + 0.075),
            tweenShapeLine(1, EVEN_LENGTH, delay),
            tweenShapeLine(2, ODD_LENGTH, delay + 0.075),
            tweenShapeLine(3, EVEN_LENGTH, delay)
        ]);
    };

    function removeListeners() {
        el.removeEventListener('mouseover', onMouseOver);
        el.removeEventListener('mouseout', onMouseOut);
    }

    function onMouseOver(e) {
        tweenMask(TRANSLATE_SHOW);
    }

    function setListeners() {
        el.addEventListener('mouseover', onMouseOver);
        el.addEventListener('mouseout', onMouseOut);
    }

    function onMouseOut(e) {
        tweenMask(TRANSLATE_HIDE);
    }

    function tweenMask(destination) {


        TweenLite.to(maskTween, 0.45, {
            ease:Cubic.easeInOut,
            translate:destination,
            onUpdate:function(){
                var translate = Math.round(maskTween.translate);
                transformRect(shareShapeMaskEls[0], -translate);
                transformRect(shareShapeMaskEls[1], translate);
            }
        });
    }

    function transformRect(rectEl, translate) {

        rectEl.setAttribute('transform', PRE_TRANSFORM + translate + ')');
    }

    function tweenShapeLine(index, destination, delay) {

        var deferred = Q.defer(),
            tweenObj = lineTweens[index],
            lineEl = sharePathEls[index];

        TweenLite.to(tweenObj, 0.75, {
            ease:Cubic.easeInOut,
            delay:delay,
            offset:destination,
            onUpdate:function(){

                lineEl.style.strokeDashoffset = Math.round(tweenObj.offset);
            },
            onComplete:deferred.resolve
        });

        return deferred.promise;
    }
};