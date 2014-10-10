(function(){

	var MAX_MOBILE_SIZE = 600,
		MOBILE_MEDIA_QUERY = '(only screen and (max-width: '+MAX_MOBILE_SIZE+'px))',
		BACKGROUND_IMAGE_URL = 'assets/images/blurred-city.jpg',
		w = window,
		doc = document,
		body = doc.body,
		introductionVisible = false,
		fallbackEl = getElementsByClassName(doc, 'fallback')[0],
		loadingBgEl = getElementsByClassName(doc, 'loading-bg')[0],
		steps = [
			initialLoad,
			featureDetection,
			injectAssets,
			injectMainHtml,
			showIntroCopy,
			injectJs
		];

	nextStep();

	function initialLoad() {

		var loadCount = 0;

		loadBgImg(checkLoadCount);
		loadWebFont(checkLoadCount);

		function checkLoadCount() {
			loadCount++;
			if(loadCount >= 2) {
				nextStep();
			}
		}
	}

	function getElementsByClassName(node, classname) {

		var a = [];

		if(node.getElementsByClassName) {

			a = node.getElementsByClassName(classname);

		} else {
			var re = new RegExp('(^| )'+classname+'( |$)'),
				els = node.getElementsByTagName('*');

			for(var i=0,j=els.length; i<j; i++) {
				if(re.test(els[i].className)) {
					a.push(els[i]);
				}
			}
		}
		return a;
	}

	var elStyle = doc.createElement('div').style,
		unPrefixedTransition = getUnPrefixed('transition'),
		unPrefixedTransform = getUnPrefixed('transform');

	function getUnPrefixed(property) {

		var omPrefixes = 'Webkit Moz O ms',
			cssomPrefixes = omPrefixes.split(' '),
			ucProp = property.charAt(0).toUpperCase() + property.slice(1),
			props = (property + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

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

		return testProps(props);
	}

	function loadWebFont(checkLoadCount) {

		loadJs('//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js', function(){

			WebFont.load({
				typekit: {id: '#######'},
				active:checkLoadCount,
				inactive:checkLoadCount
			});
		});
	}

	function loadBgImg(callback) {

		imgLoader(BACKGROUND_IMAGE_URL, function() {

			loadingBgEl.style.position = 'absolute';
			loadingBgEl.style.minWidth = '770px';
			loadingBgEl.style.minHeight = '400px';
			loadingBgEl.style.top = 0;
			loadingBgEl.style.left = 0;
			loadingBgEl.style.height = '100%';
			loadingBgEl.style.width = '100%';
			loadingBgEl.style.backgroundPosition = 'center';
			loadingBgEl.style.backgroundSize = 'cover';

			if(loadingBgEl.style[unPrefixedTransform] !== undefined && loadingBgEl.style.opacity !== undefined) {
				loadingBgEl.style.opacity = 0;
				loadingBgEl.style[unPrefixedTransform] = 'scale(1.05)';
			}

			if(loadingBgEl.style[unPrefixedTransform] !== undefined && loadingBgEl.style.opacity !== undefined) {


				body.offsetHeight;
				loadingBgEl.style[unPrefixedTransition] = 'all 0.6s';
				loadingBgEl.style[unPrefixedTransform] = 'scale(1)';
				loadingBgEl.style.opacity = 1;
			}

			loadingBgEl.style.backgroundImage = 'url(' + BACKGROUND_IMAGE_URL + ')';

			callback();
		});
	}

	function injectAssets() {

		var TWEENLITE_EASEPACK = '//cdnjs.cloudflare.com/ajax/libs/gsap/1.13.2/easing/EasePack.min.js',
			TWEENLITE = '//cdnjs.cloudflare.com/ajax/libs/gsap/1.13.2/TweenLite.min.js',
			loadCount = 0;

		loadGoogleMaps(checkLoadCount);
		loadJs(TWEENLITE_EASEPACK, checkLoadCount);
		loadJs(TWEENLITE, checkLoadCount);
		loadCss(CSS_PATH, checkLoadCount);

		function checkLoadCount() {

			loadCount++;

			if(loadCount >= 4) {
				nextStep();
			}
		}
	}


	function injectMainHtml() {

		ajaxRequest(MAIN_HTML_PATH, function(html){

			// remove stuff
			fallbackEl.parentElement.removeChild(fallbackEl);
			fallbackEl = null;

			body.style.overflow = '';
			// add stuff
			body.innerHTML = html + body.innerHTML;
			body.offsetHeight;

			nextStep();
		});
	}

	function showIntroCopy() {

		var introSubtitleEls = getElementsByClassName(doc, 'intro-subtitle'),
			introductionEl = getElementsByClassName(doc, 'intro-introduction')[0],
			tweenObjs = [
				{y:-75,o:0},
				{y:75,o:0}
			];

		introductionEl.classList.add('is-shown');

		tweenSubtitleEl(0, 0, 1, 0.4, 0.85, Cubic.easeOut);
		tweenSubtitleEl(1, 0, 1, 0.4, 0.9, Cubic.easeOut, function(){

			introductionVisible = true;
			if(steps.length === 0) {
				nextStep();
			}
		});

		function tweenSubtitleEl(index, newY, newO, time, delay, ease, callback) {

			var el = introSubtitleEls[index],
				tweenObj = tweenObjs[index];

			TweenLite.to(tweenObj, time, {
				delay:delay,
				ease:ease,
				y:newY,
				o:newO,
				onUpdate:function(){
					el.style.opacity = tweenObj.o;
					el.style[unPrefixedTransform] = 'translate3d(0,' + tweenObj.y + 'px,0)';
				},
				onComplete:callback
			});
		}

		nextStep();
	}

	function loadGoogleMaps(callback) {

		w.initialize = function() {
			w.initialize = null;

			callback();
		};

		var script = doc.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize';
		body.appendChild(script);
	}

	function injectJs() {

		loadJs(JS_PATH, nextStep);
	}

	function featureDetection() {

		if(w.matchMedia) {

			if(checkScreenSize()) {

				if(check3dSupport() && checkWebAudioSupport()) {

					nextStep();
				} else {

					showAudioFallback();
				}
			} else {

				showMobileFallback();
			}

		} else {

			showAudioFallback();
		}
	}

	function checkWebAudioSupport() {

		var audioContext = w.AudioContext || w.webkitAudioContext || null;
		return audioContext !== null;
	}

	function check3dSupport() {

		var el = document.createElement('p'),
			has3d,
			transforms = {
				'webkitTransform':'-webkit-transform',
				'OTransform':'-o-transform',
				'msTransform':'-ms-transform',
				'MozTransform':'-moz-transform',
				'transform':'transform'
			};

		// Add it to the body to get the computed style
		document.body.insertBefore(el, null);

		for(var t in transforms){
			if( el.style[t] !== undefined ){
				el.style[t] = 'translate3d(1px,1px,1px)';
				has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			}
		}

		document.body.removeChild(el);

		return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
	}

	function checkScreenSize() {

		return !(w.matchMedia(MOBILE_MEDIA_QUERY).matches || screen.width <= MAX_MOBILE_SIZE);
	}

	function nextStep() {

		if(steps.length > 0) {

			var nextMethod = steps.shift();
			nextMethod();

		} else if(introductionVisible && w.startApp) {


			w.startApp();
		}
	}


	function imgLoader(url, callback) {

		var img = new Image();

		if(img.addEventListener) {

			img.addEventListener('load', onImgLoad, true);
			img.src = url;

		} else {
			callback();
		}

		function onImgLoad() {

			img.removeEventListener('load', onImgLoad);

			callback(img);
			img = null;
		}
	}

	function ajaxRequest(url, callback) {

		var request = new XMLHttpRequest();


		request.onreadystatechange = function () {

			var response;

			if (request.readyState === 4) {

				if (request.status === 200) {

					response = request.response;
					callback(response);
				} else {
					throw new Error(request);
				}
			}
		};

		request.open('GET', url, true);
		request.send();
	}


	function loadCss(filename, callback) {

		var sheet, i,
			fileref = doc.createElement('link');

		fileref.setAttribute('rel', 'stylesheet');
		fileref.setAttribute('type', 'text/css');
		fileref.setAttribute('href', filename);

		function timerfunc() {
			for (i=0;i<doc.styleSheets.length;i++){
				sheet = doc.styleSheets[i].href;
				if(sheet !== null && sheet.substr(sheet.length-filename.length) === filename) {
					return callback();
				}
			}
			setTimeout(timerfunc,50);
		}

		if (doc.all){

			fileref.attachEvent('onreadystatechange',function() {
				if(fileref.readyState === 'complete' || fileref.readyState === 'loaded') {
					callback();
				}
			});
		} else {
			setTimeout(timerfunc,50);
		}

		doc.getElementsByTagName('head')[0].appendChild(fileref);
	}

	function loadJs(url, callback){

		var s = doc.createElement('script');
		s.src=url;
		if(s.addEventListener) {
			s.addEventListener('load',callback,false);
		}
		else if(s.readyState) {
			s.onreadystatechange = callback;
		}
		body.appendChild(s);
	}

	function showAudioFallback() {

		ajaxRequest('partials/audioFallback.html', function(html){

			ga('send', 'pageview', {
				'page': '/fallback/audio/'
			});

			fadeInFallback(html, -162);
		});
	}

	function showMobileFallback() {



		ajaxRequest('partials/mobileFallback.html', function(html){

			ga('send', 'pageview', {
				'page': '/fallback/mobile/'
			});

			fadeInFallback(html, -142);
		});
	}

	function fadeInFallback(html, marginTop) {

		var fallbackCopyEl = getElementsByClassName(fallbackEl, 'fallback-copy')[0],
			canTransform = (fallbackEl.style.opacity !== undefined && unPrefixedTransform !== '');

		fallbackCopyEl.innerHTML = html;

		var faderEls = getElementsByClassName(fallbackEl, 'fallback-fader'),
			faderEl,
			i;

		fallbackEl.style.display = '';
		fallbackEl.style.marginTop = marginTop + 'px';

		if(canTransform) {
			for(i = 0; i < faderEls.length; i++) {
				faderEl = faderEls[i];
				faderEl.style.opacity = 0;
				faderEl.style[unPrefixedTransform] = 'translateY(15px)';
			}

			body.offsetHeight;
			fallbackEl.style.opacity = '';


			for (i = 0; i < faderEls.length; i++) {
				faderEl = faderEls[i];

				faderEl.style[unPrefixedTransition] = 'all 350ms ' + (i * 40) + 'ms';// cubic-bezier(0.215, 0.610, 0.355, 1.000)';
				faderEl.style.opacity = 1;
				faderEl.style[unPrefixedTransform] = 'translateY(0)';
			}
		}
	}

})();