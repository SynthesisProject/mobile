'use strict';
/**
* Filter to convert bytes to a size
*/
var bytesToSize = () => {
	return function(bytes, showZero) {
		var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

		if (showZero && bytes === 0){
			return '0';
		}

		if (bytes === undefined || bytes === 0 ) {
			return 'n/a';
		}
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i === 0) {
			return bytes + ' ' + sizes[i];
		}
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};
};

export default bytesToSize;
