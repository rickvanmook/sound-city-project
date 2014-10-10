var Q = require('../libs/q'),
	Marker = require('./map/Marker'),
	dataManager = require('../core/DataManager'),
	domSelector = require('../utils/domSelector'),
	mapContainerEl = domSelector.first(document, 'mapContainer'),
	hasMarkers = false,
	body = document.body,
	calculator,
	markers,
	map;

var MAP_STYLE = [
		{
			'stylers': [
				{ 'visibility': 'off' }
			]
		},
		{
			'featureType': 'water',
			'stylers': [
				{ 'color': '#1a181a' },
				{ 'visibility': 'on' }
			]
		},
		{
			'featureType': 'landscape',
			'stylers': [
				{ 'visibility': 'simplified' },
				{ 'color': '#272427' }
			]
		},
		{
			'featureType': 'road',
			'stylers': [
				{ 'visibility': 'simplified' },
				{ 'color': '#312e32' }
			]
		},
		{
			'elementType': 'labels',
			'stylers': [
				{ 'visibility': 'off' }
			]
		}
	],

	MAP_OPTIONS = {
		maxZoom:18,
		minZoom:3,
		zoom: 14,
		center: new google.maps.LatLng(0,0),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		backgroundColor: '#1a181a',
		disableDefaultUI: true,
		noClear:true
	};

exports.getMap = function() { return map; };

exports.init = function() {

	var deferred = Q.defer();

	map = new google.maps.Map(mapContainerEl,MAP_OPTIONS);

	calculator = new Calculator(map);

	//styling the map
	var styleOptions = {
		name: 'SCP'
	};

	var mapType = new google.maps.StyledMapType(MAP_STYLE, styleOptions);
	map.mapTypes.set('SCP', mapType);
	map.setMapTypeId('SCP');

	// ugly hack to improve Google logo positioning
	var idleListener = google.maps.event.addListener(map, 'idle', function() {

		var anchorEls = mapContainerEl.getElementsByTagName('a'),
			logoParent,
			anchorImageEls,
			logoEl;

		if(anchorEls && anchorEls.length > 0) {

			logoParent = anchorEls[0];

			anchorImageEls = logoParent.getElementsByTagName('img');

			if(anchorImageEls && anchorImageEls.length > 0) {

				logoEl = anchorImageEls[0];
				logoEl.classList.add('js-scrubEl', 'is-googleLogo');
				google.maps.event.removeListener(idleListener);
			}
		}

		var gmnoprintEls = domSelector.all(mapContainerEl, 'gmnoprint');

		if(gmnoprintEls.length > 0) {

			gmnoprintEls.forEach(function(gmnoprintEl){
				gmnoprintEl.classList.add('js-scrubEl');
			});
		}

		if(hasMarkers === false) {
			hasMarkers = true;
			addMarkers(dataManager.getLocationList('all'));
		}

		deferred.resolve();
	});



	return deferred.promise;
};

exports.hide = function() {

	body.appendChild(mapContainerEl);
};

exports.show = function(parentEl) {

	parentEl.appendChild(mapContainerEl);
};

exports.zoomIn = function() {

	map.setZoom(map.getZoom()+1);
};

exports.zoomOut = function() {

	map.setZoom(map.getZoom()-1);
};

exports.centerMap = function(location, isPrimaryView, isAnimated) {


	var position = location.position,
		latLng = new google.maps.LatLng(position[0],position[1]);

	var projection = calculator.getProjection(),
		containerPixel = projection.fromLatLngToDivPixel(latLng);

	if(isPrimaryView) {

		containerPixel.x += 90;

	} else {

		var width = mapContainerEl.offsetWidth,
			center = width/ 2,
			centerTarget = 270 + 90,
			centerOffset = center - centerTarget;

		containerPixel.x += centerOffset;

	}

	var offsetLatLng = projection.fromDivPixelToLatLng(containerPixel);
	if(isAnimated) {
		map.panTo(offsetLatLng);
	} else {
		map.setCenter(offsetLatLng);
	}
};

function addMarkers(locations) {

	var currentLocation = dataManager.getCurrentLocation(),
		marker,position,latLng;

	markers = [];

	var sortedLocations = locations.sort(function(a, b){

		if (a.position[0] > b.position[0]) {
			return -1;
		}

		if (a.position[0] < b.position[0]) {
			return 1;
		}

		return 0;
	});

	sortedLocations.forEach(function(location){

		position = location.position;
		latLng = new google.maps.LatLng(position[0],position[1]);
		marker =  new Marker(location.index, location.number, latLng, map);

		if(currentLocation.index === location.index) {

			marker.activate();
		} else {

			marker.deactivate();
		}

		markers.push(marker);

	});
}

function Calculator(map) {

	this.div_ = null;
	this.setMap(map);
}

Calculator.prototype = new google.maps.OverlayView();
Calculator.prototype.onAdd = function(){};
Calculator.prototype.draw = function(){};