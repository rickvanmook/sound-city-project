var scpSignals = require('../../core/scpSignals'),
    domSelector = require('../../utils/domSelector'),
	checkInBounds = require('../../utils/checkInBounds'),
	instagramAPI = require('../../utils/instagramAPI'),
	InstagramCell = require('./InstagramCell'),
	COLUMN_COUNT = 8,
	ROW_COUNT = 4;

module.exports = function(el) {

	var parentEl,
		instagramFeed,
		instagramCells,
		gridWidth,
		gridHeight;

	this.init = function() {

		var cellEls = domSelector.all(el, 'grid-cell');

		instagramCells = [];
		parentEl = el.parentElement;
		scpSignals.windowResized.add(resize);

		cellEls.forEach(function(cellEl){
			instagramCells.push(new InstagramCell(cellEl));
		});

	};

	this.show = function(){

		instagramAPI().then(function(feed){

			instagramFeed = feed;
			scpSignals.aboutScrolled.add(onAboutScrolled);
		});

		resize();
	};

	function onAboutScrolled(boundsTop, boundsBottom) {

		var parentEl = el.parentNode,
			elTop = parentEl.offsetTop,
			elBottom = elTop + parentEl.offsetHeight,
			isInBounds = checkInBounds(elTop, elBottom, boundsTop, boundsBottom);

		if(isInBounds) {
			scpSignals.aboutScrolled.remove(onAboutScrolled);
			loadImage();
		}
	}

	function loadImage() {

		instagramCells.shift().init(instagramFeed[instagramCells.length%instagramFeed.length])
				.then(function(){
				if(instagramCells.length > 0) {
					loadImage();
				}
			})
	}

	this.hide = noop;
	this.dispose = function() {


		instagramCells = null;
		scpSignals.aboutScrolled.remove(onAboutScrolled);
		scpSignals.windowResized.remove(resize);
		parentEl = null;
		el = null;
	};

	function resize() {


		var parentWidth = parentEl.offsetWidth,
			parentHeight = parentEl.offsetHeight,
			cellWidth = Math.ceil(parentWidth / COLUMN_COUNT),
			cellHeight = Math.ceil(parentHeight / ROW_COUNT),
			cellSize = Math.max(cellWidth, cellHeight),
			newGridWidth = cellSize * COLUMN_COUNT,
			newGridHeight = cellSize * ROW_COUNT;

		if(newGridWidth !== gridWidth || newGridHeight !== gridHeight) {

			gridWidth = newGridWidth;
			gridHeight = newGridHeight;

			el.style.height = gridHeight + 'px';
			el.style.width = gridWidth + 'px';
		}

	}

}