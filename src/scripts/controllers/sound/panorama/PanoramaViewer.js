var Q = require('../../../libs/q'),
	Signal = require('../../../libs/signals'),
	scpSignals = require('../../../core/scpSignals'),
	audioRotator = require('../../../core/audio/AudioRotator'),
	unPrefixedTransform = require('../../../utils/unPrefixedTransform'),
	transitionEndEvent = require('../../../utils/transitionEndEvent');

module.exports = function(parentEl) {

	var container = document.createElement('div'),
		totalWidthUpdated = new Signal(),
		needsUpdating = false,
		percentage,
		dummyImg,
		loResEls = [],
		hiResEls = [],
		totalWidth,
		viewPortW,
		imgW,
		deferred,
		isBusy;

	this.init = function(assets, isGoingRight) {

		loResEls = assets;

		addImages(loResEls, isGoingRight);

		container.className = 'sound-panoramaContainer';

		if(isGoingRight) {
			container.classList.add('is-right');
			parentEl.appendChild(container);
		} else {
			container.classList.add('is-center');
			parentEl.insertBefore(container,parentEl.firstChild);
		}

		resize();
		scpSignals.windowResized.add(resize);
		scpSignals.rotationUpdated.add(onRotationUpdated);
		onRotationUpdated(audioRotator.getDegrees());

		showImages(loResEls);
		container.classList.add('has-animation');
	};


	this.update = function(assets) {

		hiResEls = assets;

		if(isBusy) {

			needsUpdating = true;
		} else {
			updateToHiRes();
		}
	};

	function addImages(imageEls) {

		deferred = Q.defer();

		if(!isBusy) {

			isBusy = true;

			dummyImg = imageEls[0];

			imageEls.forEach(function(imageEl, index){
				imageEl.className =  'sound-panorama-tile';
				imageEl.setAttribute('width', '2250');
				imageEl.setAttribute('height', '1120');

				container.appendChild(imageEl);
			});


		}

		return deferred.promise;
	}



	function showImages(imageEls) {

		document.body.offsetHeight;

		imageEls.forEach(function(imageEl, index){

			moveImg(imageEl, index);

			if(index === 0) {
				imageEl.addEventListener(transitionEndEvent, onAddReady);
			}

			imageEl.classList.add('is-shown');
		});

	}

	function onAddReady() {

		isBusy = false;
		this.removeEventListener(transitionEndEvent, onAddReady);

		deferred.resolve();

		if(needsUpdating === true) {
			needsUpdating = false;
			updateToHiRes();
		}
	}

	function updateToHiRes() {

		Q.all([
			addImages(hiResEls),
			showImages(hiResEls)
		]).then(
			function(){
				removeImages(loResEls);
				loResEls = [];
			});
	}

	function removeImages(imageEls) {

		imageEls.forEach(function(imageEl, index) {

			imageEl.parentNode.removeChild(imageEl);
			imageEl = null;
		});
	}

	this.goLeft = function() { return goDirection('is-left'); };
	this.goCenter = function() { return goDirection('is-center'); };
	this.goRight = function() { return goDirection('is-right'); };

	function goDirection(directionClass) {

		var deferred = Q.defer();
		container.addEventListener(transitionEndEvent, onReady, false);

		container.classList.remove('is-left');
		container.classList.remove('is-right');
		container.classList.remove('is-center');
		container.classList.add(directionClass);

		function onReady() {
			container.removeEventListener(transitionEndEvent, onReady);
			deferred.resolve();
		}

		return deferred.promise;
	}

	this.dispose = function() {


		scpSignals.windowResized.remove(resize);
		scpSignals.rotationUpdated.remove(onRotationUpdated);
		totalWidthUpdated.removeAll();
		parentEl.removeChild(container);
		container = null;
		loResEls = null;
		hiResEls = null;
	};

	function resize() {

		viewPortW = parentEl.offsetWidth;
		imgW = dummyImg.offsetWidth;
		totalWidth = imgW * 4;
		totalWidthUpdated.dispatch(totalWidth);
	}

	this.totalWidthUpdated = totalWidthUpdated;

	function onRotationUpdated(newDegrees) {

		var normalizeDegrees = (newDegrees+270) % 360;

		percentage = (360-normalizeDegrees) / 360;

		if(loResEls.length === 4) {
			moveImg(loResEls[0],0);
			moveImg(loResEls[1],1);
			moveImg(loResEls[2],2);
			moveImg(loResEls[3],3);
		}

		if(hiResEls.length === 4) {
			moveImg(hiResEls[0],0);
			moveImg(hiResEls[1],1);
			moveImg(hiResEls[2],2);
			moveImg(hiResEls[3],3);
		}
	}

	function moveImg(imgEl, index) {

		var elPercentage = (percentage + index * 0.25) % 1,
			elX = Math.round(Math.min(viewPortW, elPercentage * totalWidth - imgW + viewPortW/2 - imgW/2));


		if(elX !== imgEl.elX) {

			imgEl.elX = elX;
			imgEl.style[unPrefixedTransform] = 'translate3d('+elX+'px,0,0)';
		}
	}

};