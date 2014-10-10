var domSelector = require('../../utils/domSelector'),
	dataManager = require('../../core/DataManager'),
	unPrefixedTransform = require('../../utils/unPrefixedTransform'),
	scpSignals = require('../../core/scpSignals');

var ANIMATION_TIME = 0.35,
	ANIMATION_EASE = Cubic.easeOut;
var INITIAL = {
	bgR:223,
	bgG:223,
	bgB:223,

	grR:170,
	grG:171,
	grB:170,

	scale:1,
	width:38,
	height:78,
	labelY:0,
	labelRgb:51
};

var UPDATED = {
	bgR:180,
	bgG:157,
	bgB:91,

	grR:154,
	grG:129,
	grB:59,

	scale:1.465,
	width:56,
	height:114,
	labelY:-28,
	labelRgb:250
};


function Marker(locationIndex, number, point, map) {

	var isActivated = false,
		markerHtml =
		'<svg width="38" height="81" class="marker-svg">' +
		'<ellipse fill="rgba(0,0,0,0.15)" cx="15" cy="77" rx="15" ry="4"></ellipse>'+
		'<lineargradient id=SVGID_'+locationIndex+' gradientunits=userSpaceOnUse x1=-167.9546 y1=77.5156 x2=-132.0591 y2=77.5156 gradienttransform="matrix(1 0 0 1 168 -51)">' +
		'<stop class="grL" offset=0.2312 style=stop-color:#2D3130;stop-opacity:0></stop>' +
		'<stop class="grR" offset=1 style=stop-color:#2D3130;stop-opacity:0.3></stop>' +
		'</lineargradient>' +
		'<path x="10" class="bg" fill=#DFDFDF d=M18.9,0.1C29.5,0.1,38,8.4,38,18.8C38,34.3,20.7,39,20.7,78h-2c0-10.4-1.3-18.4-3.3-24.9C10,35.7,0,30,0,18.7C0,8.7,7.9,0.6,18,0C18.3,0.1,18.6,0.1,18.9,0.1z></path>' +
		'<path x="10" fill=url(#SVGID_'+locationIndex+') d=M17.9,0C7.9,0.5,0,8.6,0,18.6c0,11.3,10,17,15.3,34.5l0,0c7.1-15.5,20.6-23,20.6-34.4C36,8.7,28,0.5,17.9,0z></path>' +
		'</svg>'+
		'<div class="marker-label tk-ambroise-firmin-std">'+number+'</div>' +
		'<div class="marker-hitField"></div>';
	
	
	var markerEl = document.createElement('div');

	markerEl.className = 'marker';
	markerEl.innerHTML = markerHtml;
	
	var markerElSvg = domSelector.first(markerEl,'marker-svg'),
		svgBgEl = domSelector.first(markerEl,'bg'),
		svgGrLEl = domSelector.first(markerEl,'grL'),
		svgGrREl = domSelector.first(markerEl,'grR'),
		markerElLabel = domSelector.first(markerEl,'marker-label'),
		markerHitFieldEl = domSelector.first(markerEl,'marker-hitField');

	var self = this;
	// Now initialize all properties.
	self._point = point;
	self._map = map;
	self._div = null;
	self._markerEl = markerEl;
	self._colors = {
		width:0,
		height:0,
		bgR:INITIAL.bgR,
		bgG:INITIAL.bgG,
		bgB:INITIAL.bgB,

		grR:INITIAL.grR,
		grG:INITIAL.grG,
		grB:INITIAL.grB,
		scale:INITIAL.scale,
		labelY:INITIAL.labelY,
		labelRgb:INITIAL.labelRgb
	};

	self.setMap(map);

	scpSignals.locationDataUpdated.add(onLocationDataUpdated);

	function onLocationDataUpdated(newLocationData) {

		if(locationIndex === newLocationData.index) {
			self.activate();
		} else {
			self.deactivate();
		}

	}

	self.activate = function() {

		if(!isActivated) {

			isActivated = true;
			self.focus();
		}
	};

	self.deactivate = function() {

		if(isActivated) {

			isActivated = false;
			self.blur();
		}
	};


	self.focus = function(delay) {

		markerHitFieldEl.style[unPrefixedTransform] = 'scale(' +UPDATED.scale + ')';

		TweenLite.to(self._colors, ANIMATION_TIME, {
			ease:ANIMATION_EASE,
			delay:delay,
			bgR:UPDATED.bgR,
			bgG:UPDATED.bgG,
			bgB:UPDATED.bgB,

			grR:UPDATED.grR,
			grG:UPDATED.grG,
			grB:UPDATED.grB,

			//width:UPDATED.width,
			//height:UPDATED.height,

			scale:UPDATED.scale,
			labelY:UPDATED.labelY,
			labelRgb:UPDATED.labelRgb,

			onUpdate:self.redrawSvg
		});
	};


	self.blur = function(delay) {

		if(isActivated) {

			return;
		}

		markerHitFieldEl.style.width = INITIAL.width;
		markerHitFieldEl.style.height = INITIAL.height;
		markerHitFieldEl.style[unPrefixedTransform] = 'translateX(0)';
		
		TweenLite.to(self._colors, ANIMATION_TIME, {
			delay:delay,
			bgR:INITIAL.bgR,
			bgG:INITIAL.bgG,
			bgB:INITIAL.bgB,

			grR:INITIAL.grR,
			grG:INITIAL.grG,
			grB:INITIAL.grB,

			//width:INITIAL.width,
			//height:INITIAL.height,

			scale:INITIAL.scale,
			labelY:INITIAL.labelY,
			labelRgb:INITIAL.labelRgb,

			onUpdate:self.redrawSvg
		});
	};

	self.redrawSvg = function() {

		var colorBgR = Math.round(self._colors.bgR),
			colorBgG = Math.round(self._colors.bgG),
			colorBgB = Math.round(self._colors.bgB),
			colorBgRgb = 'rgb('+ colorBgR + ',' + colorBgG + ',' + colorBgB + ')',
			colorGrR = Math.round(self._colors.grR),
			colorGrG = Math.round(self._colors.grG),
			colorGrB = Math.round(self._colors.grB),
			colorGrRgb = 'rgb('+ colorGrR + ',' + colorGrG + ',' + colorGrB + ')',
			rgb = Math.round(self._colors.labelRgb);

		svgBgEl.setAttribute('fill', colorBgRgb);
		svgGrLEl.setAttribute('style', 'stop-color:' + colorGrRgb + ';stop-opacity:0');
		svgGrREl.setAttribute('style', 'stop-color:' + colorGrRgb + ';stop-opacity:1');

		//markerElSvg.style.width = self._colors.width;
		//markerElSvg.style.height = self._colors.height;

		var transform = 'scale('+self._colors.scale+')';

		markerElSvg.style[unPrefixedTransform] = transform;

		markerElLabel.style[unPrefixedTransform] = 'translateY('+self._colors.labelY+'px)';
		markerElLabel.style.color = 'rgb('+rgb+ ',' + rgb + ',' + rgb+')';


	};


	self.dispose = function() {

		TweenLite.killTweensOf(self._colors);
		markerHitFieldEl.removeEventListener('mouseover', this.focus);
		markerHitFieldEl.removeEventListener('mouseout', this.blur);
		markerHitFieldEl.removeEventListener('click', onMarkerClick);
		markerHitFieldEl.removeEventListener('touchstart', onMarkerClick);
	};

	markerHitFieldEl.addEventListener('mouseover', this.focus, false);
	markerHitFieldEl.addEventListener('mouseout', this.blur, false);
	markerHitFieldEl.addEventListener('click', onMarkerClick, false);

	function onMarkerClick() {

		dataManager.update(locationIndex);
	}
}



Marker.prototype = new google.maps.OverlayView();
Marker.prototype.draw = function() {

	var overlayProjection = this.getProjection();
	var pixelPoint = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this._div;



	div.style.left = (pixelPoint.x) + 'px';
	div.style.top = (pixelPoint.y) + 'px';

};


/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
Marker.prototype.onAdd = function() {

	var self = this;
	this._div = this._markerEl;


	// Add the element to the "overlayLayer" pane.
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._div);

};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
Marker.prototype.onRemove = function() {
	this._div.parentNode.removeChild(this._div);
	this._div = null;
};

module.exports = Marker;