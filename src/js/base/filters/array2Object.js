'use strict';
/**
 * Filter to convert an array into a map
 */
var array2Object = () => {
	/**
	* @param input input Array
	* @param srcIdName name of the field in the source array that contains the id
	*/
	return function(input, srcIdName) {
		var out = {};
		srcIdName = srcIdName || 'id';
		for(var idx = 0 ; idx < input.length; idx++){
			var srcObject = input[idx];
			out[srcObject[srcIdName]] = srcObject;
		}
		return out;
	};
};
export default array2Object;
