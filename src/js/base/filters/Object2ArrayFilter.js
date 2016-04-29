'use strict';
/**
 * Filter to convert a object's keys to a map
 */
var Object2ArrayFilter = function(input) {
	var out = [];
	for(var i in input){
		var obj = input[i];
		obj.key = i;
		out.push(obj);
	}
	return out;
};

/**
 * Factory to create new instances of the Object2ArrayFilter
 */
export default function Object2ArrayFilterFactory(){
	return Object2ArrayFilter;
}
