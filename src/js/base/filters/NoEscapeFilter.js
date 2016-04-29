'use strict';
/**
* Factory to create new instances of the NoEscapeFilter
* Filter to avoid angular from escaping content
*/
var NoEscapeFilterFactory = ($sce) => {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
};
NoEscapeFilterFactory.$inject = ['$sce'];
export default NoEscapeFilterFactory;
