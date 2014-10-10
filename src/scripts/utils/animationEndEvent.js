// stolen from http://stackoverflow.com/a/9090128/921964

var transitionEndEvent,
	i,
	el = document.createElement('div'),
	transitions = {
		'transition':'animationend',
		'OTransition':'oanimationend',
		'MozTransition':'animationend',
		'WebkitTransition':'webkitAnimationEnd'
	};

for (i in transitions) {
	if (transitionEndEvent === undefined &&
		transitions.hasOwnProperty(i) &&
		el.style[i] !== undefined) {

			transitionEndEvent = transitions[i];
	}
}


module.exports = transitionEndEvent;