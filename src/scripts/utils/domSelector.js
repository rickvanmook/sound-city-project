exports.all = function(parentEl, query){

    return [].slice.call(parentEl.getElementsByClassName(query),0);
};

exports.first = function(parentEl, query){
    return parentEl.getElementsByClassName(query)[0];
};