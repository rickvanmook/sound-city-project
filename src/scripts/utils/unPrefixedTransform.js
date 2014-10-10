/**! Stripped down Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-prefixed-testprop-testallprops-domprefixes
 */

var omPrefixes = 'Webkit Moz O ms',
	cssomPrefixes = omPrefixes.split(' '),
	elStyle = document.createElement('div').style,
	TRANSFORM = 'transform',
	ucProp  = TRANSFORM.charAt(0).toUpperCase() + TRANSFORM.slice(1),
	props   = (TRANSFORM + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' '),
	unPrefixedTransform = testProps(props);

function testProps( props ) {
	var prop;
	for ( var i in props ) {
		prop = props[i];
		if ( !contains(prop, '-') && elStyle[prop] !== undefined ) {
			return prop;
		}
	}
	return '';
}


function contains( str, substr ) {
	return !!~('' + str).indexOf(substr);
}

module.exports = unPrefixedTransform;