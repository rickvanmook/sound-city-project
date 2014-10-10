// stolen from http://stackoverflow.com/a/9090128/921964

var transitionEndEvent,
	i,
	el = document.createElement('div'),
	transitions = {
		'transition':'transitionend',
		'OTransition':'otransitionend',
		'MozTransition':'transitionend',
		'WebkitTransition':'webkitTransitionEnd'
	};

for (i in transitions) {
	if (transitionEndEvent === undefined &&
		transitions.hasOwnProperty(i) &&
		el.style[i] !== undefined) {

			transitionEndEvent = transitions[i];
	}
}


module.exports = transitionEndEvent;