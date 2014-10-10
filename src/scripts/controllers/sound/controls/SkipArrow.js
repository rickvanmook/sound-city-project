var dataManager = require('../../../core/DataManager');

module.exports = function(el) {

	var classList = el.classList,
		isLeft = classList.contains('sound-arrow--left');

	this.init = function() {
		el.addEventListener('click', onElClick);
	};

	function onElClick(e) {

		e.preventDefault();

		if(isLeft) {

			dataManager.previous();

		} else {

			dataManager.next();

		}
	}

	this.dispose = function() {

		el.removeEventListener('click', onElClick);
		el = null;
	};

};