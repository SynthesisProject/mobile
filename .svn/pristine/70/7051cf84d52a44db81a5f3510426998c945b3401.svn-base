'use strict';
/**
* Default fail method that rejects a deferred
* by passing the error as the reason.
*/
var SynthFail = () => {
	return function(deferred){
		return function(error){
			deferred.reject(error);
		};
	};
};
SynthFail.$inject = [];
export default SynthFail;
