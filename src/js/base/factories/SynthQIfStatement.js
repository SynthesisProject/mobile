'use strict';
var SynthQIfStatement = ($q) => {
	return function(promiseFunction, trueFunction, falseFunction){
		var deferred = $q.defer();

		promiseFunction().then((isTrue) => {
			var func = isTrue ? trueFunction : falseFunction;

			if(func == null){
				deferred.resolve();
				return;
			}

			func().then(() => {
				deferred.resolve();
			}, (reason) => {
				deferred.reject(reason);
			});
		},
		(reason) => {
			deferred.reject(reason);
		});


		return deferred.promise;
	};
};
SynthQIfStatement.$inject = ['$q'];
export default SynthQIfStatement;
