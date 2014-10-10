var dataManager = require('../../core/DataManager'),
    domSelector = require('../../utils/domSelector'),
    scpSignals = require('../../core/scpSignals'),
    Q = require('../../libs/q'),
    Signal = require('../../libs/signals'),
    City = require('./City'),
	body = document.body,
    LIST_CITY_CLASS = 'list-city',
    LIST_MARKUP = '<li class="'+LIST_CITY_CLASS+'*">' +
        '<div class="'+LIST_CITY_CLASS+'-mask"></div>' +
        '<div class="'+LIST_CITY_CLASS+'-hoverMask"></div>' +
        '<a class="'+LIST_CITY_CLASS+'-copy"><span class="'+LIST_CITY_CLASS+'-masked">#</span></a>' +
        '</li>';


module.exports = function(el) {

    var cities = [],
        cityEls = [],
        cityClicked = new Signal();

    this.cityClicked = cityClicked;
    this.init = function() {

        var cityList = dataManager.getCityList(),
            currentCityId = dataManager.getCurrentLocation().cityId,
            html = '',
            city;


        cityList.forEach(function(city) {

            cities.push(new City(city.id));

            html += LIST_MARKUP
                .replace('#', city.abbr)
                .replace('*', city.id === currentCityId ? ' is-active' : '');
        });

        el.innerHTML = html;

        var taskList = [];

        cityEls = domSelector.all(el, LIST_CITY_CLASS);

        cityEls.forEach(function(listCityEl, index){
                city = cities[index];
                taskList.push(city.init(listCityEl, currentCityId === city.cityId));
                city.clicked.add(cityClicked.dispatch);
            });

        scpSignals.windowResized.add(onWindowResize);
        onWindowResize();
        return Q.all(taskList);
    };

    function onWindowResize() {

        var totalHeight = body.offsetHeight,
            averageHeight = Math.round(totalHeight/cityEls.length),
            height;

        cityEls.forEach(function(cityEl, index) {

            if(index === cityEls.length-1) {

                height = totalHeight;
            } else {

                totalHeight -= averageHeight;
                height = averageHeight;
            }

            cityEl.style.height = height + 'px';
        });

    }

    this.update = function(cityId){

        var taskList = [],
            method;

        cities.forEach(function(city, index){

            if(city.cityId === cityId) {
                method = 'activate';
            } else {
                method = 'deactivate';
            }

            taskList.push(city[method](index/10, true));
        });

	    composeTaskList('removeListeners');

        return Q.all(taskList)
	        .then(function(){composeTaskList('addListeners');});

    };

    this.cover = function(isRightToLeft) {

	    composeTaskList('removeListeners');
	    return composeTaskList('cover', isRightToLeft === true)
		    .then(function(){composeTaskList('addListeners');});
    };

    this.uncover = function(isRightToLeft) {

	    composeTaskList('removeListeners');
	    return composeTaskList('uncover', isRightToLeft === true)
		    .then(function(){composeTaskList('addListeners');});
    };

    this.show = function() {
        return composeTaskList('show', true)
	        .then(function(){composeTaskList('addListeners');});
    };
    this.hide = function() {

	    composeTaskList('removeListeners');

	    return composeTaskList('hide', false);
    };

    this.dispose = function(){

	    cityEls = null;
	    scpSignals.windowResized.remove(onWindowResize);

	    composeTaskList('removeListeners');
        return Q.all(composeTaskList('dispose'))
            .then(function(){

                cityClicked.removeAll();
                cityClicked = null;
                cities = null;
            });
    };

    function composeTaskList(method, isRightToLeft) {

        var taskList = [];

        cities.forEach(function(city, index){

            taskList.push(city[method](index/10, isRightToLeft));
        });

        return Q.all(taskList);

    }

};
