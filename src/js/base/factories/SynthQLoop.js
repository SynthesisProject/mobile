'use strict';

/**
* An factory for a method that will execute a number of promises
* A promise function has to be specified that should either return another
* promise to execute, or null when there are no more promises.
* The factory function will return a promise which will resolve when the
* promiseFunction returns null (no more promises)
*/
var SynthQLoop = ($q) => {
	return function(promiseFunction){
		let deferred = $q.defer();
		function startNewPromise(){
			var newPromise = promiseFunction();
			// If we did not get a new promise, then we are done
			if (newPromise == null){
				deferred.resolve();
			}
			else{ // We got a promise
				newPromise.then(
					// If the promise resolve, we get the next one
					startNewPromise, // Success
					// If the promise failed, we fail too
					(reason) => { // Rejected
						deferred.reject(reason);
					},
					(status) => { // Notify
						deferred.notify(status);
					});
			}
		}

		return {
			'then' : function(resolveFunction, errorFunction, statusFunction){
				startNewPromise();
				return deferred.promise.then(resolveFunction, errorFunction, statusFunction);
			}/*,
			'notify' : function(update){
				deferred.promise.notify(update);
			}*/
		};
	};
};
SynthQLoop.$inject = ['$q'];
export default SynthQLoop;
