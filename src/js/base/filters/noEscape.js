'use strict';
var noEscape = ($sce) => {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
};
noEscape.$inject = ['$sce'];
export default noEscape;
