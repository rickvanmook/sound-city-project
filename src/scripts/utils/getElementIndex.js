module.exports = function(el) {

	var i = 0;

	while (el = el.previousElementSibling) {
		i++;
	}
	return i;
}