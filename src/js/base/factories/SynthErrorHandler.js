'use strict';
/**
* Factory method for the error handler.
* This error handler will display the error modal dialog with the error message.
* When this factory is called, it will always return a rejected promise
* with the error that it handles.
*/
var SynthErrorHandler = ($q, $rootScope, SynthError) => {
	return function(synthError){

		/*
		* If the synthError is not really a synth error.
		* We convert it to one.
		*/
		if(synthError instanceof Error){
			synthError = SynthError(synthError);
		}

		/* On the root scope there is an object 'synthError' which
		* is used by the error dialog */
		$rootScope.synthError = synthError;

		// Show the error dialog
		$('#synthErrorModal').modal('show');

		/* You must return a rejected promise, else if you had
		* a chain of promised, the chain will continue on with a
		* successfull promise */
		return $q.reject(synthError);
	};
};
SynthErrorHandler.$inject = ['$q', '$rootScope', 'SynthError'];
export default SynthErrorHandler;
