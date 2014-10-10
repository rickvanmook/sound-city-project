/*
 * Templates are being minified by grunt and placed
 * next to this file before doing the browserify dance
 */

var fs = require('fs');

var aboutTemplate = fs.readFileSync(__dirname + '/about.html', 'utf8'),
	soundTemplate = fs.readFileSync(__dirname + '/sound.html', 'utf8');

exports.aboutTemplate = aboutTemplate;
exports.soundTemplate = soundTemplate;