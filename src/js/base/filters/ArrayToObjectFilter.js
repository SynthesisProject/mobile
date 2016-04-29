'use strict';
/**
 * Filter to convert an array into a map
 * @param input input Array
 * @param srcIdName name of the field in the source array that contains the id
 */
var ArrayToObjectFilter = function(input, srcIdName) {
	var out = {};
	srcIdName = srcIdName || 'id';
	for(var idx = 0 ; idx < input.length; idx++){
		var srcObject = input[idx];
		out[srcObject[srcIdName]] = srcObject;
	}
	return out;
};

/**
 * Factory to create new instances of the ArrayToObjectFilter
 */
export default function ArrayToObjectFilterFactory(){
	return ArrayToObjectFilter;
}
