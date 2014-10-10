var Q = require('../libs/q'),
    analytics = require('../utils/analytics'),
	domSelector = require('../utils/domSelector'),
    CityList = require('../controllers/list/CityList'),
    LocationList = require('../controllers/list/LocationList'),
    TEMPLATE = '<div class="list">' +
        '<ul class="list-locations"></ul>' +
        '<ul class="list-cities"></ul>' +
    '</div>';

module.exports = function(parent) {


	var storedMethod = null,
        currentCity,
        stateDeferred,
        isBusy = false,
        el,
        cityList,
        locationList;

	this.init = function() {

        el = document.createElement('div');
        el.className = 'content';
        el.innerHTML = TEMPLATE;

        cityList = new CityList(domSelector.first(el, 'list-cities'));
        locationList = new LocationList(domSelector.first(el, 'list-locations'));

        return Q.all([
                cityList.init(),
                locationList.init()
            ])
            .then(function(){

                cityList.cityClicked.add(onCityClicked);
                parent.appendChild(el);
                document.body.offsetHeight;
            });
	};

    function onCityClicked(cityId) {
        currentCity = cityId;
        update();
    }


    function update() {

        if(!isBusy) {
            isBusy = true;
            return cityList.update(currentCity)
                .then(function(){
                    return Q.all([
                        locationList.show(currentCity)
                    ]);
                })
                .then(cityList.uncover)
                .then(doneAnimating);
        } else {
            storedMethod = update;
            stateDeferred = Q.defer();
            return stateDeferred.promise;
        }
    }

    function show () {



        if(!isBusy) {

            isBusy = true;
            return cityList.show()
                .then(locationList.show)
                .then(cityList.uncover)
                .then(doneAnimating);
        } else {
            storedMethod = show;
            stateDeferred = Q.defer();
            return stateDeferred.promise;
        }

	}

    function hide() {

        if(!isBusy) {
            isBusy = true;

            return cityList.hide()
                .then(locationList.hide)
                .then(function(){return cityList.uncover(true);})
                .then(doneAnimating);
        } else {
            storedMethod = hide;

            stateDeferred = Q.defer();
            return stateDeferred.promise;
        }


	}

	this.show = function(){

		analytics.setCurrentPage('/list/');

		return show();
	};
	this.hide = hide;

    function doneAnimating() {
        isBusy = false;

        if(storedMethod !== null) {

            storedMethod(stateDeferred)
                .then(stateDeferred.resolve);
            storedMethod = null;

        }
    }

	this.dispose = function() {


        return Q.all([
                cityList.dispose(),
                locationList.dispose()
            ])
            .then(function(){

                cityList = null;
                locationList = null;

                el.parentNode.removeChild(el);
                el = null;

            });
	};
};