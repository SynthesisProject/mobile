'use strict';
/**
 *
 */
var MYFilter = function(input) {
	console.log(input);
};

/**
 * Factory to create new instances of the MYFilter
 */
export default function MYFilterFactory(){
	return MYFilter;
}
