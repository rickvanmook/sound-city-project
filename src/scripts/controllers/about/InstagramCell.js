var imgLoader = require('../../utils/imgLoader');

module.exports = function(el) {


	this.init = function(data) {


		var img = new Image();
		el.setAttribute('href', data.link);
		img.classList.add('is-loading');

		return imgLoader(data.url, img)
			.then(function(){


				img.style.width = '100%';
				img.style.height = '100%';
				img.setAttribute('alt', data.link);

				el.appendChild(img);
				document.body.offsetHeight;

				img.classList.remove('is-loading');
				img.classList.add('is-loaded');

			});
	};
};